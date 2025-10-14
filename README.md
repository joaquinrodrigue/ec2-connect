# simple-cms

- Author: Joaquin Rodriguez

# Description
A simple Content Management System project I'm working on.
This project runs using Node.js, namely Express along with MySQL. It
implements a Model-based CRUD API for annyone into buzzwords.

This project is also heavily under development still. If you're reading 
this, several features are unimplemented still.

# Usage and Compiling

# Other discussion
I'll add to this section as I see fit for some decisions I've made.
If you've looked at the `user` section of the server code, I should 
probably mention the following: The database I'm using to develop this
project is specific to my university, and I don't have create user
permissions. As a result, the "users" are just in a table that stores
their username and encrypted password as standard database rows. I'm
not sure if this is how this is handled in real codebases out there, but
it's the only way I can realistically make this project work in the
database I'm working with.

While I'm on that note, this project runs through localhost. 

# Sources
