/**
 * Small compendium manipulators for Foundry.
 * Requires fs, csv-parser and nedb
 */
'use strict';

const fs = require('fs');
const csv = require('csv-parser');
const Datastore = require('nedb');
  
// Hardcoded filenames, because I am lazy
let filename = '/home/bithir/Development/github/test/symbaroumabilitiesen.db';
let csvfile = '/home/bithir/Documents/RPG/Symbaroum/Data/abilities.csv';

let csvData = {};

let db = new Datastore({ filename: filename, autoload: true });


/**
 * Important - the pattern is specific for my csv. A better pattern for others might be to just capture everything. 
 * If you just want to change the pattern and not code below, change the pattern below to /(.*)/
 */
let pattern = /^([^(]* +)/;

/**
 * Read the csv file and push it into a structure to make it easy to grab.  The index name is the ability name
 * that we will use for lookup.
 */
fs.createReadStream(csvfile)
.pipe(csv())
.on('data', (row) => {
    let indexName = row["Name"].match(pattern);
    csvData[indexName[0].trim().toLowerCase()] = row;    
})
.on('end', () => {
    processDB();
});


/**
 * Once finished reading the CSV, go through the compendium, find something with the matching name and update the fields
 * that I need. For me it is the descriptions, as they are not part of the Unofficial Symbaroum files.
 * I replace any line-breaks in the csv with <br /> so that they have html line breaks when opened inside of Foundry.
 */
function processDB() 
{
    // Lookup all abilities
    db.find({ type: 'ability'}, function(err, docs) {
        if(docs !== null && docs !== undefined)
        {            
            for( let ability of docs) {
                // For every ability, look up what data we have in the CSV
                let csvRowData = csvData[ability.name.toLowerCase()];
                if( csvRowData !== null && csvRowData !== undefined)
                {
                     ability.data.description = csvRowData["Description"].replace(/(?:\r\n|\r|\n)/g, '<br/>');
                     ability.data.novice.description = csvRowData["Novice"].replace(/(?:\r\n|\r|\n)/g, '<br/>');
                     ability.data.adept.description = csvRowData["Adept"].replace(/(?:\r\n|\r|\n)/g, '<br/>');
                     ability.data.master.description = csvRowData["Master"].replace(/(?:\r\n|\r|\n)/g, '<br/>');
                     db.update({ _id:ability["_id"]},ability, function() {
                         // I ignore any messages from nedb
                     });
                }
                else 
                {
                    console.log("--- Missing ability "+ability.name);
                }
            }
        } else {
            console.log("Nothing");
        }
    });
}

 