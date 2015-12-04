import sys
import csv
import random

def dedupe(ls):
    seen = set()
    seen_add = seen.add
    return [ x for x in ls if not (x in seen or seen_add(x))]

def main(infile, outfile):
    titles = []
    with open(outfile, 'w') as fp:
        a = csv.writer(fp, delimiter=',')

        ####### issues with weird a######

        with open(infile) as csvfile:
            csvfile = csvfile.read()
            csvfile = csvfile.replace("u'", "'")
            csvfile = csvfile.replace("u\"", "'") 
            spamreader = csv.reader(csvfile.splitlines())
            spamreader = list(spamreader)
            a.writerow(spamreader[0])
            spamreader = spamreader[1:]
            random.shuffle(spamreader)
            for row in spamreader:
                #print "TITTLES", titles
                #print 'THIS', row[0].lstrip().strip()
                if len(row) < 4:
                    continue
                title_clean = row[3].lstrip().strip().replace('&#8217;', "\'").replace('mln', 'million')
                if title_clean in titles:
                    print 'seen title', title_clean
                    continue
                if row[0] == '':
                    continue
                
                titles.append(title_clean)
                #print 'unseen title', title_clean
                body = row[0] 
                if 'mbox' in body:
                    print 'MBOX', title_clean
                    continue
                if body.count('By') > 5:
                    print 'By count', body.count('By'), title_clean
                    continue

                body = body.replace('itoggle caption', '').replace('hide caption', '')
                body = body.replace('&#8217;', "\'") 
                body = body.split('\n')
                body = [x.lstrip() for x in body]
                body = [x.strip() for x in body if x.strip()]
                body = [x.decode('utf-8') for x in body ]
                body = dedupe(body)

                body = [' '.join(x.split()) for x in body if x != '' and x != 'i']  
                body = "\n\n".join(body)
                a.writerow(row)

    """
    titles = []
    json = []
    for r in rows:
        title = r[0]
        if process.extractOne(title, titles):
            if process.extractOne(title, titles)[1] > 90:
                print 'skip:', title
                continue
        print 'add:', title
        titles.append(title)

        json.append({'title': r[0], 'url': r[1], \
                'time': datetime.datetime.strftime(gmt_to_est(r[2]), '%I:%M %p'), \
                'datetime': datetime.datetime.strftime(r[2], '%Y-%m-%dT%H:%M:%S'), \
                'org': r[3], \
                'desc': sent_detector.tokenize(BeautifulSoup(r[4]).get_text())[0] \
                    if sent_detector.tokenize(BeautifulSoup(r[4]).get_text()) \
                    else ""})

    """
    
if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
