# prescription-hasher

## Inspiration
We decided to address the lack of coordination between different medical entities that allowed people to maliciously receive multiple prescriptions for the same drug.

## What it does
Prescription Hasher is used whenever a patient is prescribed something. Data will be inputted unique to the patient and the prescription such as name, date of birth, gender, and the drug that is being prescribed. This data then goes through an irreversible hash, and is sent to be added to the database, along with information about when, where, and who prescribed the medicine.

If the hash already exists in the database, this means that there is a very high probability that this same patient has gotten the same prescription recently, and the user will be notified along with the doctor and contact information associated with the matching hash. This allows the user to contact the other entity that the patient previously got a prescription from, confirm the situation, and address the patient in question.

Throughout this process, the identifying information for any patient is never stored; only a generated hash from the data when it is first submitted.

The app's structure utilizes a POST request to make a new entry to the database and check if it exists. This allows for the app to be utilized as an API in the future, and the process of checking new prescriptions can be automated in the background.

## Future development
Future features would include:
- Ability to log in (inaccessible to public)
- Entries expire when the prescription can be refilled
- Expand list of drugs and make it easily searchable (or autocomplete)
- Improvement to hashing algorithm and developing additional algorithms to use in sequence
- Add authentication to API so that independent systems can securely use it
- Additional parameters to use in hashing

#Try it
The app is live [here.](http://prescription-hasher.azurewebsites.net/new_entry.html)
Please note that the site is not fully functional, and is simply a proof of concept that allows you to submit entries, and it will tell you if you submitted safely or encountered a collision. The easiest way to test the collision event is to press submit twice (with the same data).

Credit to collaborators Sunaina Shashikumar, and Ahmed Sayed.

