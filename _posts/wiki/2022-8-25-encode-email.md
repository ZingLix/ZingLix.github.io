---
layout: post
title: "Encode Email"
subtitle: ""
date: 2022-8-25
author: "ZingLix"
header-style: 'text'
knowledge: true
hidden: true
tags:
  - Tools
---

<script>
function encodeEmail(email, key) {
    // Hex encode the key
    var encodedKey = key.toString(16);

    // ensure it is two digits long
    var encodedString = make2DigitsLong(encodedKey);

    // loop through every character in the email
    for(var n=0; n < email.length; n++) {

        // Get the code (in decimal) for the nth character
        var charCode = email.charCodeAt(n);
        
        // XOR the character with the key
        var encoded = charCode ^ key;

        // Hex encode the result, and append to the output string
        var value = encoded.toString(16);
        encodedString += make2DigitsLong(value);
    }
    return encodedString;
}

function make2DigitsLong(value){
    return value.length === 1 
        ? '0' + value
        : value;
}

function go(){
    var text = document.getElementById('input').value;
    console.log(text)
    console.log(encodeEmail(text, 156));
    document.getElementById('output').value= encodeEmail(text, 156);
}
</script>

<input id="input">
<br>
<button onclick="go()">Encode</button>
<br>
<input id="output">