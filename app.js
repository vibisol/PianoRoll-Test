import PianoRoll from './pianoroll.js';

class PianoRollDisplay {
  constructor(csvURL) {
    this.csvURL = csvURL;
    this.data = null;
  }

  async loadPianoRollData() {
    try {
      const response = await fetch('https://pianoroll.ai/random_notes');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      this.data = await response.json();
    } catch (error) {

      console.error('Error loading data:', error);
    }
  }

  preparePianoRollCard(rollId) {
    const cardDiv = document.createElement('div');
    cardDiv.classList.add('piano-roll-card');

    // Create and append other elements to the card container as needed
    const descriptionDiv = document.createElement('div');
    descriptionDiv.classList.add('description');
    descriptionDiv.textContent = `This is a piano roll number ${rollId}`;
    cardDiv.appendChild(descriptionDiv);

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.classList.add('piano-roll-svg');
    svg.setAttribute('width', '80%');
    svg.setAttribute('height', '150');

    // Append the SVG to the card container
    cardDiv.appendChild(svg);

    return { cardDiv, svg }
  }

  async generateSVGs() {
    if (!this.data) await this.loadPianoRollData();
    if (!this.data) return;

    const pianoRollContainer = document.getElementById('pianoRollContainer');
    pianoRollContainer.innerHTML = '';
    for (let it = 0; it < 20; it++) {
      const start = it * 60;
      const end = start + 60;
      const partData = this.data.slice(start, end);

      const { cardDiv, svg } = this.preparePianoRollCard(it)

      pianoRollContainer.appendChild(cardDiv);
      const roll = new PianoRoll(svg, partData);
    }
  }




}




document.getElementById('loadCSV').addEventListener('click', async () => {

  const lineVert = document.querySelector('.LineVert');
  if (lineVert) {
    lineVert.remove();
  }
  const csvToSVG = new PianoRollDisplay();
  await csvToSVG.generateSVGs();

  let pianoRollContainer = document.getElementById("pianoRollContainer");
  pianoRollContainer.style.gridTemplateColumns = 'repeat(3, 1fr)';
  pianoRollContainer.style.padding = '20px 20px 0px 20px';

  assignEventHandlers();



  
});




let isDragging = false;
let greenIsDragging = false
let startX = 0;
let selectionRect;


function getSVGCoordinates(event, svgElement) {
  const svgPoint = svgElement.createSVGPoint();
  svgPoint.x = event.clientX;
  svgPoint.y = event.clientY;
  return svgPoint.matrixTransform(svgElement.getScreenCTM().inverse());
}

function resetRectColorsExcept(excludedElement) {
  document.querySelectorAll('.piano-roll-card:not(.expanded) svg.piano-roll-svg rect.note-rectangle').forEach(rect => {
    if (rect.closest('.piano-roll-card') !== excludedElement) {
      rect.setAttribute('fill', 'black');
    }
  });
}




function assignEventHandlers() {
  let pianoRolls = document.querySelectorAll(".piano-roll-card");
  pianoRolls.forEach(roll => {
    roll.addEventListener("click", handlePianoRollClick);
  });


}




function removeSVGEventListeners(svgElement) {

  svgElement.removeEventListener('mouseenter', showCursorLine);
  svgElement.removeEventListener('mousemove', moveCursorLine);
  svgElement.removeEventListener('mouseleave', hideCursorLine);
  svgElement.removeEventListener('click', ChangeColore);
  
}

let greenStartPoint = 0;
let greenFinishPoint = 0;


function handlePianoRollClick() {

 
  
  let pianoRolls = document.querySelectorAll(".piano-roll-card");
  let isSameRollClicked = this.classList.contains('expanded');
  

  if (!isSameRollClicked) {
   
    const oldClickedLine = document.querySelector('.LineVert');
    const myBlock = document.querySelector('.myBlock')
    if (oldClickedLine) {
      oldClickedLine.remove();
    }
   
      document.querySelectorAll('.myBlock').forEach(block => {
        block.remove();
      });
    


      document.querySelectorAll('.del-button').forEach(del => {
        del.remove();
      });
    

   
      document.querySelectorAll('.CrossX').forEach(x => {
        x.remove();
      });
    
   

  }


  pianoRolls.forEach(r => {
    r.classList.remove("expanded");
    r.style.gridColumn = 3;
    const svgElem = r.querySelector('svg.piano-roll-svg');
    if (svgElem) {
      removeSVGEventListeners(svgElem);
    }

    
    
  });

 
  this.classList.add("expanded");
  this.style.gridColumn = "";
 

  

  cursorLine.style.display = 'none';
  resetRectColorsExcept(this);

 
  
  let pianoRollContainer = document.getElementById("pianoRollContainer");
  pianoRollContainer.classList.toggle("selected", this.classList.contains('expanded'));

  const pianoRollSVG = this.querySelector('svg.piano-roll-svg');
  if (pianoRollSVG && this.classList.contains('expanded')) {

    pianoRollSVG.addEventListener('mousedown', startSelection);
    pianoRollSVG.addEventListener('mousedown', e => {
      const svgPoint = getSVGCoordinates(e, e.currentTarget);
      greenStartPoint = svgPoint.x
      console.log(svgPoint.x)
    });
    pianoRollSVG.addEventListener('mousemove', dragSelection);

    pianoRollSVG.addEventListener('mouseup', endSelection);
    pianoRollSVG.addEventListener('mouseup', e => {
      const svgPoint = getSVGCoordinates(e, e.currentTarget);
      greenFinishPoint = svgPoint.x
      if (greenStartPoint === greenFinishPoint) {
        ChangeColore(e)
      }
    });
    pianoRollSVG.addEventListener('mouseenter', showCursorLine);
    pianoRollSVG.addEventListener('mousemove', moveCursorLine);
    pianoRollSVG.addEventListener('mouseleave', hideCursorLine);
   

    

  }


}



function ChangeColore(event) {
 
  
  const pianoRollCard = event.currentTarget.closest('.piano-roll-card');
  if (!pianoRollCard.classList.contains('expanded')) {
    return; 
  }


  console.log('SVG clicked!');

  const pianoRollSVG = event.currentTarget;
  const svgWidth = pianoRollSVG.getBoundingClientRect().width;
  const relativeClickX = event.offsetX / svgWidth;

  const rects = pianoRollSVG.querySelectorAll('rect.note-rectangle');
  rects.forEach(rect => {
    const rectX = parseFloat(rect.getAttribute('x'));
    const rectWidth = parseFloat(rect.getAttribute('width'));
    const rectRight = rectX + rectWidth;

    if (relativeClickX <= rectX) {
    
      rect.setAttribute('fill', 'initial');
    } else if (relativeClickX >= rectRight) {
    
      rect.setAttribute('fill', 'green');
    } else {

      const newWidth = relativeClickX - rectX;
      rect.setAttribute('width', newWidth.toString());
      rect.setAttribute('fill', 'green');


      const newRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      newRect.setAttribute('x', relativeClickX.toString());
      newRect.setAttribute('y', rect.getAttribute('y'));
      newRect.setAttribute('width', (rectWidth - newWidth).toString());
      newRect.setAttribute('height', rect.getAttribute('height'));
      newRect.setAttribute('fill', 'initial');
      newRect.setAttribute('class', 'note-rectangle');
      rect.parentElement.appendChild(newRect);
    }
  });

  const oldClickedLine = document.querySelector('.LineVert');

  if (oldClickedLine) {
    oldClickedLine.remove();
  }

  const svgRect = pianoRollSVG.getBoundingClientRect();




  const clickedLine = document.createElement('div');
  clickedLine.classList.add('LineVert');
  clickedLine.style.position = 'absolute';
  clickedLine.style.height = `${svgRect.height}px`;
  clickedLine.style.width = '1px';
  clickedLine.style.top = `${svgRect.top}px`;
  clickedLine.style.left = `${svgRect.left + (relativeClickX * svgRect.width)}px`;
  clickedLine.style.backgroundColor = 'black';
  clickedLine.style.top = `${svgRect.top}px`;
  clickedLine.style.left = `${event.clientX}px`;
  clickedLine.style.pointerEvents = 'none';
  document.body.appendChild(clickedLine);

 
}


function showCursorLine() {
  cursorLine.style.display = 'block';
}

function moveCursorLine(event) {
  const svgRect = this.getBoundingClientRect();
  const cursorLineHeight = svgRect.bottom - svgRect.top;
  cursorLine.style.height = `${cursorLineHeight}px`;
  cursorLine.style.top = `${svgRect.top}px`;
  cursorLine.style.left = `${event.clientX}px`;
}

function hideCursorLine() {
  cursorLine.style.display = 'none';
}



let endX = 0;
let selectionId = 0;




function startSelection(event) {
  isDragging = true;



  const svgPoint = getSVGCoordinates(event, event.currentTarget);
  startX = svgPoint.x;


  

  selectionRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  selectionRect.setAttribute('x', startX);
  selectionRect.setAttribute('y', 0);
  selectionRect.setAttribute('width', 0); 
  selectionRect.setAttribute('height', '100%');
  selectionRect.setAttribute('fill', 'rgba(255,219,139, 0.5)');
 
  selectionRect.classList.add('myBlock')
 


  const svgContainer = event.currentTarget;
  svgContainer.appendChild(selectionRect);



}


function dragSelection(event) {
  if (!isDragging) return;

  const svgPoint = getSVGCoordinates(event, event.currentTarget);
  const currentX = svgPoint.x;

  const width = Math.abs(startX - currentX);
  const x = (currentX > startX) ? startX : currentX;

  selectionRect.setAttribute('x', x);
  selectionRect.setAttribute('width', width);
}

function endSelection(event) {
 
  isDragging = false;

  const svgPoint = getSVGCoordinates(event, event.currentTarget);
  const endX = svgPoint.x;
  
  const selectedNotes = [];


  const notes = event.currentTarget.querySelectorAll('rect.note-rectangle');

  notes.forEach(note => {
    const noteX = parseFloat(note.getAttribute('x'));
    const noteWidth = parseFloat(note.getAttribute('width'));
    const noteEndX = noteX + noteWidth;

    if ((noteX >= startX && noteX <= endX) || (noteEndX >= startX && noteEndX <= endX) || (noteX <= startX && noteEndX >= endX)) {
      selectedNotes.push(note);
    }
  });

  console.log(`Number of selected notes: ${selectedNotes.length}`);


  console.log(`Selection started at X: ${startX} and ended at X: ${endX}`);

  const delButtonX =  endX ; 

  selectionId++;

  if(!(startX == endX)){
    const svgContainer = event.currentTarget;
   
   const delButtonRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  delButtonRect.setAttribute('x', delButtonX);
  delButtonRect.setAttribute('y', 0);
  delButtonRect.setAttribute('width', 0.02);
  delButtonRect.setAttribute('height', 0.1);
  delButtonRect.setAttribute('fill', '#ff0000'); 
  delButtonRect.classList.add('del-button');
  delButtonRect.setAttribute('id',  + selectionId);
 
  svgContainer.appendChild(delButtonRect);

  
  

  const crossStartX = delButtonX + 0.005; 
  const crossStartY = 0.02; 
  const crossEndX = delButtonX + 0.015; 
  const crossEndY = 0.08; 


  const cross = document.createElementNS("http://www.w3.org/2000/svg", "path");

  cross.setAttribute('d', `M ${crossStartX} ${crossStartY} L ${crossEndX} ${crossEndY} M ${crossStartX} ${crossEndY} L ${crossEndX} ${crossStartY}`);
  cross.setAttribute('stroke', '#ffffff'); 
  cross.setAttribute('stroke-width', '0.005');

  cross.classList.add('CrossX');
  cross.setAttribute('id',  + selectionId);

  selectionRect.setAttribute('id',  + selectionId);

  

  svgContainer.appendChild(cross);


  cross.addEventListener('click', function(event) {

    event.stopPropagation();

    const currentCrossId = this.id;
    const currentSelectionId = currentCrossId.replace('cross-', 'selection-');
    const currentDelButtonId = currentCrossId.replace('cross-', 'delButton-');


    console.log('Cross ID:', currentCrossId);
    console.log('Selection ID:', currentSelectionId);
    console.log('Delete Button ID:', currentDelButtonId);


    document.getElementById(currentSelectionId)?.remove();
    document.getElementById(currentDelButtonId)?.remove();
    this.remove(); 

   
  });
 
  }

 


}

assignEventHandlers();


