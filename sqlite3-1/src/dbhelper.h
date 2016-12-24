/*
 *	$Id: dbhelper.h 2015 07/23/2015 11:53:10 AM $
 *	
 * 	Copyright(C) 2015 allan (hc), <hcamwdn@163.com> 
 *	
 *  Description:  
 *
 */

#ifndef _DBHELPER_H_
#define _DBHELPER_H_
#include <sqlite3.h> 

#define DB_SQL_MAX_LEN 1024

#define DATA_EMPTY 0


int db_nonquery_operator(const char *sqlstr,int (*bind)(sqlite3_stmt *,int index,void * arg),void *param);

int db_nonquery_by_varpara(const char *sql,const char *fmt,...);

int db_nonquery_transaction(int (*exec_sqls)(sqlite3 *db,void * arg),void *arg);

int db_query_by_varpara(const char *sql,int (*create)(sqlite3_stmt *stmt,void *arg),void *arg,const char *fmt,...);

int db_query_count_result(const char *sql);

int db_stmt_get_blob(sqlite3_stmt *stmt,int index,unsigned char *out);

int db_stmt_get_text(sqlite3_stmt *stmt,int index,char *out);

int db_stmt_get_int(sqlite3_stmt *stmt,int index);

double db_stmt_get_double(sqlite3_stmt *stmt,int index);

#endif

