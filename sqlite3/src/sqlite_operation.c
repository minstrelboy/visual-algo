#include <stdio.h>
#include <sqlite3.h>
#include <string.h>
#include <stdlib.h>

typedef struct userinfo_s {
        int userid;
        char username[33];
        struct userinfo_s * next;
} userinfo_t;

int get_all_userinfos(userinfo_t * u){
        char sql[512] = "select * from userinfo;";
        sqlite3 *db = NULL;
        sqlite3_stmt * stmt = NULL;
        int ret_open = sqlite3_open("test.db",&db);
        if(ret_open !=SQLITE_OK){
                printf("open test.db fail\n");
                return -1;
        }
        int ret = sqlite3_prepare(db,sql,-1,&stmt,NULL);
        if (ret != SQLITE_OK){
                printf("prepare fail \n");
                return ret;
        }
        ret = sqlite3_step(stmt);
        int count = 0;
        if(ret != SQLITE_ROW){
                return 0;
        }else{
                userinfo_t * p = u;
                do{
                        userinfo_t * user = calloc(sizeof(userinfo_t),1);
                        user->userid = sqlite3_column_int(stmt,0);
                        const char * name = sqlite3_column_text(stmt,1);
                        if (name){
                                int len = strlen(name);
                                strncpy(user->username,name,len);
                        }
                        user->next = NULL;
                        p->next = user;
                        p = p->next;
                        count ++;
                }while((ret = sqlite3_step(stmt))==SQLITE_ROW);
        }
        sqlite3_finalize(stmt);
        sqlite3_close(db);
        return count;
}

void free_userinfo_t(userinfo_t * u){
        userinfo_t * p = u;
        userinfo_t * q = p->next;
        while(q){
                p = q;
                q =p->next;
                free(p);
        }
}

int insert_userinfo_t(userinfo_t * u){
        char sql[512] = "insert into userinfo (userid,username) values (?,?)";
        sqlite3 *db = NULL;
        sqlite3_stmt * stmt = NULL;
        int ret_open = sqlite3_open("test.db",&db);
        if(ret_open !=SQLITE_OK){
                printf("open test.db fail\n");
                return -1;
        }
        int ret = sqlite3_prepare(db,sql,-1,&stmt,NULL);
        if (ret != SQLITE_OK){
                printf("prepare fail \n");
                return ret;
        }
        sqlite3_bind_int(stmt,1,u->userid);
        sqlite3_bind_text(stmt,2,u->username,32,NULL);
        ret = sqlite3_step(stmt);
        if(ret == SQLITE_DONE){
                ret = SQLITE_OK;
        }
        sqlite3_finalize(stmt);
        sqlite3_close(db);
        return ret;
}

void test_get_all_userinfos(){
        userinfo_t u;
        int count = get_all_userinfos(&u);
        userinfo_t * p = u.next;
        userinfo_t * q = p;
        printf("count:%d\n",count);
        while(p){
                printf("userid:%d username:%s \n",p->userid,p->username);
                p = p->next;
        }
        free_userinfo_t(&u);
}

void test_insert_into_userinfo_t(){
        userinfo_t new_user;
        new_user.userid = 5;
        char new_name[33]= "micheal";
        strncpy(new_user.username,new_name,32);
        int ret= insert_userinfo_t(&new_user);
        printf("ret = %d\n",ret);

}

int main(int argc, char *argv[])
{
        test_get_all_userinfos();
        test_insert_into_userinfo_t();
        test_get_all_userinfos();
        return 0;
}
