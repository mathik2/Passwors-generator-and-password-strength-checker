let upperLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
let lowerLetters = 'abcdefghijklmnopqrstuvwxyz'
let specialCharcter = "!@#$%^&*(){}[]|/<>.:-_~'"
let specialCharcterLength = specialCharcter.length
function Generate () {
  var output = ''
  for (let index = 0; index < 3; index++) {
    output += upperLetters.charAt(Math.floor(Math.random() * 26) + 1)
    output += lowerLetters.charAt(Math.floor(Math.random() * 26) + 1)
    output += Math.floor(Math.random() * 10) + 1
    output += specialCharcter.charAt(
      Math.floor(Math.random() * specialCharcterLength) + 1
    )
  }

  document.getElementById('result').innerText = output
}

function copyText () {
  var copyText = document.getElementById('result')

  navigator.clipboard.writeText(copyText.innerText)
}
function StrengthChecker () {
  let passcode = document.getElementById('password').value

  if (passcode.match(/[A-Z]/g)) {
    document.getElementById('Uppercase').style.color = 'green'
  } else {
    document.getElementById('Uppercase').style.color = 'red'
  }
  if (passcode.match(/[a-z]/g)) {
    document.getElementById('Lowercase').style.color = 'green'
  } else {
    document.getElementById('Lowercase').style.color = 'red'
  }
  if (passcode.match(/[0-9]/g)) {
    document.getElementById('Number').style.color = 'green'
  } else {
    document.getElementById('Number').style.color = 'red'
  }
  if (passcode.match(/[!@#$%^&*(){}[]|\/<>.:-_~']/g)) {
    document.getElementById('SpecialCharacter').style.color = 'green'
  } else {
    document.getElementById('SpecialCharacter').style.color = 'red'
  }
  if (passcode.length >= 8) {
    document.getElementById('Length').style.color = 'green'
  } else {
    document.getElementById('Length').style.color = 'red'
  }
}
