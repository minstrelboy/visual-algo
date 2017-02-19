#include <stdio.h>
#include <stdlib.h>
#include "na_queue.h"
#include <time.h>

typedef struct  number_s number_t;
typedef unsigned char u_char;
struct number_s{
        int value;
        na_queue_t queue;
};

number_t *
new_number_t(int v){
        number_t * n = calloc(sizeof(number_t),1);
        n->value = v;
        return n;
}

void free_number_t(na_queue_t * h){
        na_queue_t * p = h->next;
        while(p!=h){
                na_queue_remove(p);
                number_t* q =na_queue_data(p,number_t,queue);
                free(q);
                p = h->next;
        }
}

void
print_queue(na_queue_t * h){
        na_queue_t * p = h->next;
        while(p!=h){
                number_t * q = na_queue_data(p,number_t,queue);
                printf("%d ",q->value);
                p=p->next;
        }
        printf("\n");
}

void
insert_node(na_queue_t * h,int v){
        number_t * n= new_number_t(v);
        if(na_queue_empty(h)){
               na_queue_insert_tail(h,&n->queue);
               return;
        }
        na_queue_t * p = h->next;
        while(p!=h){
               number_t * num = na_queue_data(p,number_t,queue);
               if(num->value > v){
                       na_queue_t* q = na_queue_prev(p);
                       na_queue_t* c = &n->queue;
                       na_queue_next(q) = c;
                       na_queue_next(c) = p;
                       na_queue_prev(c) = q;
                       na_queue_prev(p) = c;
                       return;
               }
               p = na_queue_next(p);
        }
        na_queue_insert_tail(h,&n->queue);

}

int get_random(){
        srand(time(0));
        return rand()/100000000;
}
int main(int argc, char *argv[])
{
        na_queue_t h;
        na_queue_init(&h);
        int i;
        for (i = 0; i < 10; i++) {
                int r = get_random();
                printf("add number:%d\n",r);
                insert_node(&h,r);
                print_queue(&h);
                sleep(1);
        }
        free_number_t(&h);
        return 0;
}
