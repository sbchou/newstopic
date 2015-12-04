import glob
import json
import sys
import math
"""
No more chunking!
"""
def flatten(ls):
    return [item for sublist in ls for item in sublist] 

def main(TODAY):
    files = glob.glob('data/' + TODAY + '/' + TODAY + '/*')
    data = []
    for f in files:
        parsed = json.load(open(f, 'r'))
        data.append(parsed)
 
    # uniq titles
    data = { each['title'] : each for each in data }.values()

    #strip whitespace and remove empty
    cleaned_data = []
    for d in data:
        body = d['body'] 
        body = body.strip()
        if 'mbox' in body:
            continue

        if body:
            body = body.split("\n")
            body = "\n".join([p.strip() for p in body if p.strip()])
            d['body'] = body.strip()

            # Highlight all the entities in the body of the article
            people = d['people']
            first_and_last = flatten([p.split(" ") for p in people])
            
            body_with_entities = body
            for name in first_and_last:
                body_with_entities = body_with_entities.replace(name, '<b><font color="blue">' + name + '</font></b>')

            for org in d['orgs']:
                body_with_entities = body_with_entities.replace(org, '<b><font color="green">' + org + '</font></b>')


            d['body_with_entities'] = body_with_entities.strip()
            
            d['label_ids'] = []; #  add labels array
            d['user_ids'] = [];
            d['confidence'] = math.floor(float(d['election_confidence']) * 100); 

            cleaned_data.append(d) 
    print len(cleaned_data), "articles processed"
    json.dump(cleaned_data, open('data/' + TODAY + '/' + TODAY +'-CLEAN.json', 'w'))

  
if __name__ == "__main__":
    main(sys.argv[1])