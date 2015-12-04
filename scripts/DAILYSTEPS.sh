# in root
TODAY=$(date +"%d-%m-%Y") &&
mkdir data/$TODAY &&
scp -r soph@cat3:/home/users/pralav/electome_latest/electome/data/outputs/dump/recent_dumps/$TODAY data/$TODAY



for f in data/$TODAY/$TODAY/*.json; do (cat "${f}"; echo ",") >> data/$TODAY/$TODAY-all.json; done
 sort -u data/$TODAY/$TODAY-all.json >> data/$TODAY/$TODAY-uniq.json
 
python scripts/preprocess_json.py $TODAY
cp data/$TODAY/20.json private/


mmongo export -c labels -o data/labels/labels$TODAY.json