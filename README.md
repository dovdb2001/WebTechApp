# WebTechApp
Introduction

In this assignment, you will need to build an interactive client-server application that implements the functionality
of a university course registration system You can look at Osiris or search for other course registration systems (tutorials) for inspiration.
Your web application should provide listing and descriptions of available courses.
A student user should be able to browse the courses, search them and registered for courses.
A set of basic functions must be provided. Extra credits will be awarded for implementing additional features.
Functional Requirements

    Each course should have
        title,
        program
        academic level (MSc/BSc),
        semester,
        short description,
        name of the teacher, and
        photo of the teacher.
    Front-end for anonymous users (AU).
    An AU should be able to:
        browse all courses;
        search for a course based on its title;
        refine the browsed/searched courses based on their programs, academic levels and semesters
    Front-end for registered students (RS).
    A RS should be able to do everything that an AU can do, plus:
        register for a course;
        look at her/his current course registrations;
        unregister from a course;
        edit her/his profile.
    Basic search function needs to be implemented - matching the searched terms with the title of the course. Search essentially allows restricting the set of browsed courses to those that match the search term(s). Another way of restricting this set is by selecting a program, an academic level, and a semester.
    Courses should be presented/listed in groups of 10 per page. Implement a pagination interface (this can be also done with a "more" button, or "indefinite scrolling" that loads more results). When presented, the curses should be ordered by program (alphabetically), then academic level (BSc-MSc), then semester, then title (alphabetically). It should be clear, where a new program, academic level, semester starts.
    Clicking on a course should load its page where all 7 attributes of the course are presented (see above) including the photo of the teacher. This page should contain a "Register" button. Clicking on this button should require a confirmation (e.g., “Are you sure?”). If the confirmation is given, the registration happens. If a RS declines the confirmation, the registration does not happen. Once a registration happens, the course should be added to the current registrations of the corresponding RS.
    A student should not be able to register for courses that:
        do not correspond to her/his program,
        do not correspond to his/her academic level,
        she/he is already registered for; if a student has unregistered from a course, she/he should be able to register for it again.
    You need to have at least 40 courses with various attributes:
        teachers (at least 20),
        programs (at least 3),
        academic levels (2),
        semesters (2).
    Student registration interface needs to be implemented, where the student specifies his/her login, password, first and last name, program and academic level. A student should be able to change all these attributes at any time (watch out for conflicts with the current course registrations).

Technical requirements

You are expected to apply the core technologies that we have studied during the course:

    HTML 5.0 and CSS 3.0 – follow the requirements specified in Assignment 1 to make sure your website represents its content according to the recent standards. Make sure W3C HTML5.0 and CSS3.0 validators do not generate errors and warnings.
    Accessibility and Responsive Design - your pages must continue following the accessibility standards and be designed at least for screens of two resolutions: small - for mobile phone and large - for tablets and bigger (you are welcome to further split the design between tablets and laptops/desktops).
    JavaScript – your website must use JavaScript. Use ES6 classes to represent students and course in your code
    Node.JS (and its frameworks) – you have to implement the server side of your website with Node.JS. Usage of Express.JS is very much advised. You can use additional Node.JS packages if you like.
    Use sessions to maintained continuity of interaction with logged-in students. It should be possible for several students to be logged-in at the same time. You can, but do not have to use persistent sessions.
    AJAX – you will need AJAX. One mandatory place to use it is for displaying courses in groups per page. It is up to you to decide if you need to use it in other places.
    It is up to you whether you use JSON or XML to exchange information between the client and the server.
    SQLite – courses, students and their properties need to be stored in an SQLite database and accessed with the Node.JS using sqlite3 module. When courses' and students' attributes are displayed, the information must come from the database. When new students are registered and when courses are registered for the database must be updated.
    Your website should work at least on the last versions of Chrome and Firefox.
    Each HTML, CSS and JS file should have a comment at the top explaining the role and the functionality of the file and its structure. All JS methods and variables should have dedicated comments explaining their purpose.
    Use a logger recording all HTTP requests to your website.
    It is up to you whether to use or not HTML templating engines such as Jade.
    Make sure that you website is protected at least against SQL injections and Cross-site scripting.

Extra Credit options

    Social Web features: To get an extra credit for the Social Web features, you need to implement ratings and comments. Students should be able to comment and rate courses. A dedicated interface to provide ratings and comments should be available. For every course, an average rating should be computed and all comments together with students' logins should be displayed. Ratings and comments should be stored in the database. Add at least 50 comments and ratings to your course (overall, not per course).
    Semantic Web features: To get an extra credit for the Semantic Web features, you need to implement the RDF import service for adding new courses. The service should have a dedicated interface page (with a superuser access), where a properly formatted RDF-description of a product can be added. You will need to use the https://schema.org/Course vocabulary for serializing RDF. Once a course is added it should appear in the site's list of courses.
    Adaptive Web features: To get an extra credit for the Adaptive Web features, you need to implement a simple version of the collaborative filtering recommender. A user should receive recommendations from the website based on the current course registrations and the corresponding registrations of like-minded users. If you implement the social web feature, you can add ratings to your model as well.

Procedure and Submission

You complete this assignment as groups. Make sure to follow the instructions posted by Chris as one of the
announcements on how to use your web-space and configure your website at http://webtech.science.uu.nl/

The submission consists of two things:

    the live version of your online web app at http://webtech.science.uu.nl/ and
    the archive submitted through the BlackBoard

When submitting the archive, you need to zip your entire website including the HTML, CSS, client side JS and
server side JS files, as well as the DB file and all the images. Add a readme.txt file containing the following:

    Your group id
    Names and student numbers of all authors;
    A direct link (full URL) to the location of the website at http://webtech.science.uu.nl/
    A brief explanation of your web-site, the structure of your application, including every content file and every code file, the structure of your database.
    Logins and passwords of all registered students.
    The SQL definition of your database (the CREATE TABLE statements).
    If you implement extra credit features, describe them in a separate section (for the Semantic Web extra
    credit option, include the sample RDFs to test the import feature and the login/password of the superuser).

Submit the zip file using the BlackBoard system.

Follow the academic integrity rules and good coding conventions specified for assignment 1 and assignment 2.

Use the feedback received for assignments 1 & 2 to improve your HTML/CSS/JavaScript.
