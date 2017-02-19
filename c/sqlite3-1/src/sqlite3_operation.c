#include "dbhelper.h"
#include "na_queue.h"
#include <stddef.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sqlite3.h>


typedef struct userinfo_s{
        int userid;
        char username[32];
        na_queue_t queue;
}userinfo_t;


 void free_userinfo_t(na_queue_t *h){
    na_queue_t *head = h,*pos,*n;
    userinfo_t *p = NULL;
    na_queue_for_each_safe(pos,n,head){
        p = na_queue_data(pos,userinfo_t,queue);
        free(p);
    }
    na_queue_init(head);
 }

int bind_userinfo_t(sqlite3_stmt * stmt,int index,void * arg){
        int rc;
        userinfo_t * param = arg;
        sqlite3_bind_int(stmt,1,param->userid);
        sqlite3_bind_text(stmt,2,param->username,strlen(param->username),NULL);
        rc = sqlite3_step(stmt);
        if (rc != SQLITE_DONE)
                return rc;
        return SQLITE_OK;
}

int create_userinfo_t(sqlite3_stmt * stmt,void * arg){
        na_queue_t * h = arg;
        na_queue_init(h);
        userinfo_t * u;
        int ret,count = 0;
        ret = sqlite3_step(stmt);
        if(ret != SQLITE_ROW){
                return 0;
        }
        do
        {
                u = calloc(sizeof(userinfo_t),1);
                if(!u){
                        goto CREATE_USERINFO_FAIL;
                }
                u->userid = db_stmt_get_int(stmt,0);
                db_stmt_get_text(stmt,1,u->username);
                na_queue_insert_tail(h,&(u->queue));
                count ++;
        } while ((ret = sqlite3_step(stmt)) == SQLITE_ROW);
        return count;
CREATE_USERINFO_FAIL:
        free_userinfo_t(h);
        return 0;
}

void printusers(na_queue_t *h){
        userinfo_t * q=NULL;
        na_queue_foreach(q,h,userinfo_t,queue){
                printf("userid:%d username:%s\n",q->userid,q->username);
        }
}

int get_all_userinfo(na_queue_t * h){
        return db_query_by_varpara("select * from userinfo;",create_userinfo_t,h,NULL);
}

int add_a_userinfo(userinfo_t * u){
        return db_nonquery_operator("insert into userinfo(userid,username) values (?,?)",bind_userinfo_t,u);
}

int main(int argc, char *argv[])
{
        printf("test dbhelper \n");
        na_queue_t h;
        int ret = get_all_userinfo(&h);
        printf("ret:%d\n",ret);
        printusers(&h);
        free_userinfo_t(&h);
        userinfo_t newuser;
        newuser.userid = 7;
        strncpy(newuser.username,"White",10);
        add_a_userinfo(&newuser);
        get_all_userinfo(&h);
        printusers(&h);
        free_userinfo_t(&h);
        return 0;
}
