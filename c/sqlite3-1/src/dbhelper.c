/*
 *	$Id: dbhelper.c 2015 07/23/2015 10:33:08 AM $
 *	
 * 	Copyright(C) 2015 allan (hc), <hcamwdn@163.com> 
 *	
 *  Description: 
 *
 */
#include <stdio.h>
#include <string.h>
#include <pthread.h>
#include "na_queue.h"
#include "dbhelper.h"

#define DB_NAME "test.db"

static pthread_mutex_t db_mutex_lock = PTHREAD_MUTEX_INITIALIZER;


static int db_bind_by_var(sqlite3_stmt *stmt,const char *fmt,va_list args)
{
	int len,npara=1;
	int ret = SQLITE_OK;
	if(fmt == NULL){
		return ret;
	}

   	for(;*fmt;++fmt){
		if(*fmt != '%')
			continue;
		++fmt;
		//get length
		len = 0;
		while(isdigit(*fmt)){
			len = len * 10 + (*fmt - '0');
			++fmt;
		}
		switch(*fmt){
		case 'd':
			ret = sqlite3_bind_int(stmt,npara,va_arg(args,int));
			break;
		case 's':
			{
			char *str = va_arg(args,char *);
			ret = sqlite3_bind_text(stmt,npara,str,strlen(str),NULL);
			}
			break;
		case 'x':
			{
			unsigned char *pdata;
			pdata = va_arg(args,char *);
			ret = sqlite3_bind_blob(stmt,npara,pdata,len,NULL);
		//	printf_phex("blob",pdata,len);
			}
			break;
		default:
			ret = SQLITE_ERROR;
			break;
		}
		++npara;
		if(ret)
			return ret;
	}	
	return ret;
}

/* 
 * ===  FUNCTION  ======================================================================
 *         Name:  db_query_by_varpara
 *  Description:  数据库查询操作，可以带变参绑定
 *  @sql       :  sql 
 *  @create    :  取得数据并创建节点
 *  @arg       :  用户用于create的参数
 *  @fmt       :  格式字符串，%s string,%d int,%nx 长度为N的二进制串
 *  ...        :  变参
 *  Return     :  查询到数据的条数 
 * =====================================================================================
 */
int db_query_by_varpara(const char *sql,int (*create)(sqlite3_stmt *stmt,void *arg),void *arg,const char *fmt,...)
{
	sqlite3 *db = NULL;
	sqlite3_stmt *stmt = NULL;
	if(sql == NULL){
//		return SQLITE_ERROR;
		return 0;
	}
	pthread_mutex_lock(&db_mutex_lock);
	int rc = sqlite3_open(DB_NAME,&db);
	if(rc != SQLITE_OK){
		printf("open database failed,rc=%d",rc);
		pthread_mutex_unlock(&db_mutex_lock);
		return 0;
	}

	rc = sqlite3_prepare(db,sql,-1,&stmt,NULL);
	if(rc != SQLITE_OK){
		printf("database prepare fail,rc=%d",rc);
		goto DB_EXEC_FAIL;
	}

	if(fmt){
		va_list args;
		va_start(args,fmt);
		rc = db_bind_by_var(stmt,fmt,args);
		va_end(args);
		if(rc){
			printf("database bind fail,rc=%d",rc);
			goto DB_EXEC_FAIL;
		}
	}

	if(create){
		rc = (*create)(stmt,arg);
	}else{
		rc = (sqlite3_step(stmt),0);
	}
	sqlite3_finalize(stmt);
	goto DB_EXEC_OK;
DB_EXEC_FAIL:
	printf("db operator failed,rc=%d",rc);
	rc = 0;
DB_EXEC_OK:
	sqlite3_close(db);
	pthread_mutex_unlock(&db_mutex_lock);
	return rc;
}




/* 
 * ===  FUNCTION  ======================================================================
 *         Name:  db_exec_noquery
 *  Description:  执行非查询操作 
 *  @sqlstr    :  sql,多条语句由';'分开
 *  @bind      :  绑定sql中的未知变量操作 
 *  @param     :  绑定中的参数
 *  @bind.index:  sql语句序号 
 *  Return     :  0 or error
 * =====================================================================================
 */
int db_nonquery_operator(const char *sqlstr,int (*bind)(sqlite3_stmt *,int index,void * arg),void *param)
{
	sqlite3 *db = NULL;
	sqlite3_stmt *stmt = NULL;
//	char *emsg = NULL;
	if(sqlstr == NULL){
		return SQLITE_ERROR;
	}
	pthread_mutex_lock(&db_mutex_lock);
	int rc = sqlite3_open(DB_NAME,&db);
	if(rc != SQLITE_OK){
		printf("open database failed,rc=%d",rc);
		pthread_mutex_unlock(&db_mutex_lock);
		return rc;
	}
	rc = sqlite3_exec(db,"begin transaction",0,0,NULL);
	if(rc != SQLITE_OK){
		printf("begin transaction:ret=%d",rc);
		goto DB_BEGIN_FAIL;
	}
	char sql[DB_SQL_MAX_LEN];
	int index = 0,offset=0,n=0;
	while(sqlstr[index] != 0){
		offset = 0;
		do{
			if(offset >= DB_SQL_MAX_LEN){
				printf("sql is too long,(%d)",offset);
				rc = SQLITE_ERROR;
				goto DB_EXEC_FAIL;
			}
			if((sqlstr[index] != ';') && (sqlstr[index] != 0)){
				sql[offset++] = sqlstr[index++];
			}else{
				sql[offset] = '\0';
				if(sqlstr[index] == ';') index++;
				n++;
				break;
			}
		}while(1);
		printf("sql:%s",sql);
		rc = sqlite3_prepare(db,sql,-1,&stmt,NULL);
		if(rc != SQLITE_OK){
			printf("prepare,error,%d",rc);
			goto DB_EXEC_FAIL;
		}
		if(bind){
			rc = (*bind)(stmt,n,param);
		}else{
			rc = sqlite3_step(stmt);
		}
		sqlite3_finalize(stmt);
		if((rc != SQLITE_OK) && (rc != SQLITE_DONE)){
			printf("bind");
			goto DB_EXEC_FAIL;
		}
	}
	rc = sqlite3_exec(db,"commit transaction",0,0,NULL);
	if(rc){
		printf("commit transaction:%d",rc);
		goto DB_EXEC_FAIL;
	}
	goto DB_EXEC_OK;
DB_EXEC_FAIL:
	if(sqlite3_exec(db,"rollback transaction",0,0,NULL)){
		printf("rollback transaction error");
	}
DB_BEGIN_FAIL:
//	sqlite3_free(emsg);
	printf("db operator failed,rc=%d",rc);
DB_EXEC_OK:
	sqlite3_close(db);
	pthread_mutex_unlock(&db_mutex_lock);
	return rc;
}

int db_nonquery_by_varpara(const char *sql,const char *fmt,...)
{
	sqlite3 *db = NULL;
	sqlite3_stmt *stmt = NULL;
	if(sql == NULL){
		return SQLITE_ERROR;
	}
	pthread_mutex_lock(&db_mutex_lock);
	int rc = sqlite3_open(DB_NAME,&db);
	if(rc != SQLITE_OK){
		printf("open database failed,rc=%d",rc);
		pthread_mutex_unlock(&db_mutex_lock);
		return rc;
	}
	printf("sql:%s",sql);
	rc = sqlite3_prepare(db,sql,-1,&stmt,NULL);
	if(rc != SQLITE_OK){
		printf("prepare,");
		goto DB_EXEC_FAIL;
	}
	if(fmt){
		va_list args;
		va_start(args,fmt);
		rc = db_bind_by_var(stmt,fmt,args);
		va_end(args);
		if(rc){
			goto DB_EXEC_FAIL;
		}
	}
	rc = sqlite3_step(stmt);
	sqlite3_finalize(stmt);
	if((rc != SQLITE_OK) && (rc != SQLITE_DONE)){
		printf("bind");
		goto DB_EXEC_FAIL;
	}
	rc = 0;
	goto DB_EXEC_OK;
DB_EXEC_FAIL:
DB_BEGIN_FAIL:
	printf("db operator failed,rc=%d",rc);
DB_EXEC_OK:
	sqlite3_close(db);
	pthread_mutex_unlock(&db_mutex_lock);
	return rc;
}


int db_nonquery_transaction(int (*exec_sqls)(sqlite3 *db,void * arg),void *arg)
{
	sqlite3 *db = NULL;
	sqlite3_stmt *stmt = NULL;
//	char *emsg = NULL;
	pthread_mutex_lock(&db_mutex_lock);
	int rc = sqlite3_open(DB_NAME,&db);
	if(rc != SQLITE_OK){
		printf("open database failed,rc=%d",rc);
		pthread_mutex_unlock(&db_mutex_lock);
		return rc;
	}
	rc = sqlite3_exec(db,"begin transaction",0,0,NULL);
	if(rc != SQLITE_OK){
		printf("begin transaction:%d",rc);
		goto DB_BEGIN_FAIL;
	}
	
	if(exec_sqls){
		rc = (*exec_sqls)(db,arg);
	}else{
		rc = SQLITE_ERROR;
	}
	if((rc != SQLITE_OK) && (rc != SQLITE_DONE)){
		printf("prepare,error,%d",rc);
		goto DB_EXEC_FAIL;
	}
	
	rc = sqlite3_exec(db,"commit transaction",0,0,NULL);
	if(rc){
		printf("commit transaction:%d",rc);
		goto DB_EXEC_FAIL;
	}
	goto DB_EXEC_OK;
DB_EXEC_FAIL:
	if(sqlite3_exec(db,"rollback transaction",0,0,NULL)){
		printf("rollback transaction:error");
	}
DB_BEGIN_FAIL:
//	sqlite3_free(emsg);
	printf("db operator failed,rc=%d",rc);
DB_EXEC_OK:
	sqlite3_close(db);
	pthread_mutex_unlock(&db_mutex_lock);
	return rc;
}



static int db_get_count(sqlite3_stmt *stmt,void *arg)
{
	int ret,*count=arg;
	ret = sqlite3_step(stmt);
	if(ret != SQLITE_ROW)
		return SQLITE_EMPTY;
	*count = db_stmt_get_int(stmt,0);
	return SQLITE_OK;
}


/* 
 * ===  FUNCTION  ======================================================================
 *         Name:  db_query_count_result
 *  Description:  查询计数结果的第一列第一行，其它忽略
 *  @sql       :  查询计数的SQL语句
 *  Return     :  查询到计数返回计数，否则一律返回0 
 * =====================================================================================
 */
int db_query_count_result(const char *sql)
{
	int ret,count=0;
	ret = db_query_by_varpara(sql,db_get_count,&count,NULL);
	if(ret == SQLITE_OK)
		return count;
	return 0;
}


int db_stmt_get_blob(sqlite3_stmt *stmt,int index,unsigned char *out)
{
	const char *pdata = sqlite3_column_blob(stmt,index);
	int len = sqlite3_column_bytes(stmt,index);
	if(pdata){
		memcpy(out,pdata,len);
		return len;
	}
	return 0;
}

int db_stmt_get_text(sqlite3_stmt *stmt,int index,char *out)
{
	const unsigned char *pdata = sqlite3_column_text(stmt,index);
	if(pdata){
		int len = strlen(pdata);
		strncpy(out,pdata,len);
		return len;
	}
	return 0;
}

int db_stmt_get_int(sqlite3_stmt *stmt,int index)
{
	return sqlite3_column_int(stmt,index);
}

double db_stmt_get_double(sqlite3_stmt *stmt,int index)
{
	return sqlite3_column_double(stmt,index);
}

