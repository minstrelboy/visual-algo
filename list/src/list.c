#include <stdio.h>

typedef struct struct_node_s{
        int value;
        struct struct_node_s * prev;
        struct struct_node_s * next;
}node_t;

void
node_init(node_t * h){
        h->prev = h;
        h->next = h;
}

node_t *
node_new(int v){
        node_t * p = calloc(sizeof(node_t),1);
        p->value = v;
        p->next = p;
        p->prev = p;
        return p;
}

void
node_insert_head(node_t * h,node_t * p){
        node_t * q = h->next;
        h->next = p;
        p->prev = h;
        p->next = q;
        q->prev = p;
}

void
node_insert_tail(node_t * h,node_t * p){
        node_t * q = h->prev;
        h->prev = p;
        p->next = h;
        q->next = p;
        p->prev = q;
}

void
node_remove(node_t * p){
        node_t * h = p->prev;
        node_t * q = p->next;
        h->next = q;
        q->prev = h;
}

void
node_free(node_t * h){
        node_t * p = h->next;
        while(p != h){
                node_remove(p);
                free(p);
                p = h->next;
        }
}

void
node_print(node_t * h){
        printf("list:");
        node_t * p = h->next;
        while(p != h){
                printf("%d ",p->value);
                p=p->next;
        }
        printf("\n");
}

int main(int argc, char *argv[])
{
        printf("node_init:\n");
        node_t h;
        node_init(&h);
        node_print(&h);
        printf("node_insert_tail:\n");
        for (int i = 0; i < 10; i++) {
                node_t * p = node_new(i);
                node_insert_tail(&h,p);
        }
        node_print(&h);
        printf("node_insert_head value 10 :\n");
        node_t * p = node_new(10);
        node_insert_head(&h,p);
        node_print(&h);
        printf("node_remove value 10 :\n");
        node_remove(p);
        node_print(&h);
        node_free(&h);
        printf("node_free:\n");
        node_print(&h);
        printf("----------------end---------------\n");
        return 0;
}
