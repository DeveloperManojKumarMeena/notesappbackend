const express = require('express');

const app = express();
app.use(express.json());
let notes = []

app.get('/notes',(req,res)=>{
  res.json(notes);
})

app.post('/notes',(req,res)=>{
  notes.push(req.body);
  res.status(201).send('Note added');
})

app.patch('/notes/:index',(req,res)=>{
  const index = req.params.index; 
  notes[index] = req.body;
  res.send('Note updated');
})

app.delete('/notes/:index',(req,res)=>{
  const index = req.params.index; 
  notes.splice(index,1);
  res.send('Note deleted');
})




app.listen(3000, () => {
  console.log('Server is running on port 3000');
});