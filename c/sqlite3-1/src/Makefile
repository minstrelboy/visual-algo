#compile sqlite3_operation
objects = dbhelper.o sqlite3_operation.o
edit:$(objects)
	gcc $(objects) -o sqlite3_operation -lpthread -lsqlite3 -std=c99

dbhelper.o : na_queue.h dbhelper.h
sqlite3_operation.o : na_queue.h dbhelper.h

PHONY : clean
clean:
	rm sqlite3_operation $(objects)
