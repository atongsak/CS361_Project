const express = require("express")
const fs = require('fs')
const app = express()
const readline = require('readline')

// var logger = require("./lib/logger")

// app.use(logger)

app.use(express.static("static"))
app.use(express.json())

let selectedConditions = {
    size: "small-egg",
    height: "meter",
    surface: "hard"
};

let data = {
    survived: false,
    delta_v: 0.0,
    time: 0.0,
    final_force: 0.0,
    mass: 0.0,
    height: 0.0,
    surface: "hard"
}

app.get("/", function (req, res, next) {
    res.status(200).sendFile(__dirname + "/static/index.html")
})

app.get("/setup", function (req, res, next) {
    res.status(200).sendFile(__dirname + "/static/setup.html")
})

app.post("/setup", function(req, res, next) {
    console.log("body", req.body)

    const receivedData = req.body.newData;

    // Update selectedConditions
    selectedConditions = {
        ...selectedConditions,
        ...receivedData
    }

    fs.writeFileSync('parameters.json', JSON.stringify(selectedConditions, null, 2))

    res.status(200).json({ message: "Selected conditions updated successfully." })
})

app.get("/loadingpage", function(req, res, next) {
    res.status(200).sendFile(__dirname + "/static/loadingpage.html")
})

app.get("/activity", function(req, res, next) {
    // res.status(202).sendFile(__dirname + "/static/loadingpage.html")

    const rl = readline.createInterface({
        input: fs.createReadStream("results.txt")
    })

    let lineNumber = 0

    rl.on("line", (line) => {
        lineNumber++;
        // Parse values based on line number
        switch(lineNumber){
            case 1: 
                data.survived = line.trim().toLowerCase() === "survived"
                break
            case 2:
                data.delta_v = parseFloat(line.trim())
                break
            case 3:
                data.time = parseFloat(line.trim())
                break
            case 4: 
                data.final_force = parseFloat(line.trim())
                break
            case 5:
                data.mass = parseFloat(line.trim())
                break
            case 6: 
                data.height = parseFloat(line.trim())
                break
        }
    })
    
    rl.on("close", () => {
        if(selectedConditions.surface == "hard"){
            data.surface = "Hard floor"
        } else if(selectedConditions.surface == "inchfoam"){
            data.surface = "1 inch foam"
        } else{
            data.surface = "Foam box"
        }
        
        setTimeout(function(){
            console.log(data)
            res.status(200).sendFile(__dirname + "/static/activity.html")
        }, 2000)
    })
})

app.get("/getData", function(req, res) {
    res.json(data); 
})

const PORT = process.env.PORT || 3000;

app.listen(PORT, function(){
    console.log(`Server is listening on port ${PORT}`)
})