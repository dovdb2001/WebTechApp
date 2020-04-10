.
├── README.md
├── access.log
├── comments.md
├── database
│   ├── dbdef.txt
│   ├── dbfill.txt
│   └── main.db
├── package-lock.json
├── package.json
├── public
│   ├── favicon.ico
│   ├── images
│   ├── javascript
│   │   ├── account-update.js
│   │   ├── account.js
│   │   ├── browse.js
│   │   ├── course-details.js
│   │   └── enrolled.js
│   ├── main.css
│   └── mamida_logo.png
├── server.js
└── views
    ├── account-update.html
    ├── account.html
    ├── browse.html
    ├── course-details.html
    ├── course-information.html
    ├── enrolled-courses.html
    ├── index.html
    ├── login.html
    ├── not-found.html
    └── register.html
 
README.md: all the basic information requested to be included by the assignment
access.log: stores all logs that morgan logger creates
comments.md: this file, overview and explanation of all files found in this project
database: contains all files pertaining to the database
    dbdef.txt: holds all the create table statements used in the database
    dbfill.txt: holds all the data off the courses used and the default users and comments
    main.db: the database file itself
package.json: holds basic project information and a list of used dependencies
public: all resources publicly avaible from this site
    favicon.ico: the icon that is displayed in the tabbar
    images: this directory holds all teachers images
    javascript: this directory holds all the javascript files
        account-update.js: aids the page account-update.html
        account.js: aids the page account.html
        browse.js: aids the pages index.html and browse.html
        course-details.js: aids the pages course-details.html and course-information.html
        enrolled.js: aids the page enrolled-courses.html
    main.css: contains all the style rules used by this website
    mamida_logo.png: the logo used in the header of the site
server.js: 
views: this directory holds all html files
    account-update.html: the page where users can edit their password and / or account information  (only accessable when logged in)
    account.html: the page that displays the users current account information (only accessable when logged in)
    browse.html: this page allows the user to browse all available course (only accessable when logged in)
    course-details.html: this page displays details pretaining to a specific course 
    course-information.html: this page displays details pretaining to a specific course and allows the user to enroll is this course if possible (only accessable when logged in)
    enrolled-courses.html: this page displays all the courses the user is enrolled in
    index.html: this page allows the user to browse all available course
    login.html: this page allows a user to login in to their account
    not-found.html: this page informs the user that the requested url could not be found
    register.html: this page allows a user to register a new account
