"""
Chunk large file of stories into 20-storie files
"""
import csv
import sys
 
 # TODO: CHANGE OUTPUT TO THE CORRECT DIRECTORY
def main(infile, chunksize, TODAY): 
    chunksize = int(chunksize)
    with open(infile) as csvfile:
        spamrider = csv.reader(csvfile)
        pusheen = list(spamrider)
        for i in xrange(0,len(pusheen), chunksize):
            with open('data/' + TODAY + '/' + str(i) + '.csv', 'w+') as outfile:
                wr = csv.writer(outfile)
                if i == 0:
                    wr.writerows(pusheen[i:i+chunksize])

                elif i + 20 <= len(pusheen):
                    wr.writerow(['body',
                                 'byline',
                                 'description',
                                 'title',
                                 'url',
                                 'topics',
                                 'people',
                                 'org',
                                 'election_confidence',
                                 'authors',
                                 'date_written',
                                 'orgs',
                                 'article_id',
                                 'date_access'])
                    wr.writerows(pusheen[i:i+chunksize])
                else: 
                    
                    wr.writerow(['body',
                                 'byline',
                                 'description',
                                 'title',
                                 'url',
                                 'topics',
                                 'people',
                                 'org',
                                 'election_confidence',
                                 'authors',
                                 'date_written',
                                 'orgs',
                                 'article_id',
                                 'date_access'])
                    wr.writerows(pusheen[i:])
 
if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2], sys.argv[3])
