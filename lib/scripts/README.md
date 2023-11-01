# Scripts Folder

This folder contains utility scripts. Triggered periodically or after an event (e.g. after a donation). Scripts run to keep database consistency, ensure data is appropriately linked, or to update different areas (e.g. updating a donor object to reflect a new `stripe_cust_id`, without adding to latency in delivering the donation tax receipt).

This is done for two reasons:
1. The codebase is relatively small, and full blown classes introduce unnecessary boilerplate, where interfaces can get the job done
2. Flexibility - there are a few types of donations, and implementing if cases in each class is a lot more code than a function that handles each accordingly.