#yes local is 3001

TODAY=$(date +"%d-%m-%Y") &&
mongoimport -h localhost:3001 --db meteor --collection articles --type json --file data/$TODAY/$TODAY-CLEAN.json --jsonArray &&
echo 'imported files to local' &&


CMD=`meteor mongo -U sorting-hat.meteor.com | tail -1 | sed 's_mongodb://\([a-z0-9\-]*\):\([a-f0-9\-]*\)@\(.*\)/\(.*\)_mongoimport -u \1 -p \2 -h \3 -d \4 -c articles --type json --jsonArray_'` &&

$CMD data/$TODAY/$TODAY-CLEAN.json &&
echo 'imported files to production'