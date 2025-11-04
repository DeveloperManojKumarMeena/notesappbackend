const express = require('express');

const app = express();
app.use(express.json());
let notes = []
app.get('/',(req,res)=>{
  res.send('Hello World!');
});

app.post('/notes',(req,res)=>{
    const note = req.body;
    notes.push(note);
    console.log('Note added:', notes);
  res.send('Note created!' + JSON.stringify(notes));
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});