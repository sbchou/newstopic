# in root
TODAY=$(date +"%d-%m-%Y") &&
mmongo export -c labels -o data/labels/labels$TODAY.json &&
echo 'exported local labels to data/labels/'

# get today's labels
mmongo sorting-hat.meteor.com export -c labels -o data/labels/labels$TODAY.json &&
echo 'exported production labels to data/labels/'

# -q '{ a: { $gte: 3 } }' 
# for filtering