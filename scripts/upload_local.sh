#yes local is 3001

TODAY=$(date +"%d-%m-%Y") &&
mongoimport -h localhost:3031 --db meteor --collection articles --type json --file data/$TODAY/$TODAY-CLEAN.json --jsonArray &&
echo 'imported files to local'  
 