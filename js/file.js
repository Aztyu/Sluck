$(document).ready(function() {
    var textarea = document.getElementById('chat_box');

    console.log(textarea);

    textarea.ondrop = dropEvent;
    textarea.ondragover = dragOverEvent;
});

function dropEvent(event){
  console.log('Droppp !!!!!!');
  event.preventDefault();

  // If dropped items aren't files, reject them
  var dt = event.dataTransfer;
  if (dt.items) {
    // Use DataTransferItemList interface to access the file(s)
    for (var i=0; i < dt.items.length; i++) {
      if (dt.items[i].kind == "file") {
        var f = dt.items[i].getAsFile();
        console.log("... file[" + i + "].name = " + f.name);
      }
    }
  } else {
    // Use DataTransfer interface to access the file(s)
    for (var i=0; i < dt.files.length; i++) {
      console.log("... file[" + i + "].name = " + dt.files[i].name);
    }
  }
  console.log(event);
}

function dragOverEvent(event){
    event.preventDefault();
  console.log(event);
}
