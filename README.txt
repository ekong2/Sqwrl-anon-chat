Commands after every change you do:

git status
git add -A
git commit -m 'message'
git tag tagname
git push --tags -u origin master
git push heroku master
heroku open

if there's a warning on heroku about some changes
not being pushed, then simply do:

git pull heroku master
then:
git push heroku master

For windows-----------------------------------------------------------
Otherwise if you wish to automate it then we have to create a script:

go to the directory where gitbash resides in.
go to the subdirectory called bin
create a file with no extension (this is called a script) named git-2push
type this into the file:

#!/bin/bash -e
    git push origin master
    git push heroku master

save it.

whenever youre on the repo, type in git-2push to execute the script
Done.

For Mac--------------------------------------------------------------
dunno? maybe the same? otherwise stack overflow