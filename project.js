window.onload = function () {
  //pieChart('projectsPie', projectsData)
  //showLabelColor(projectsData)
  //setContentArea()
  //underlineHeading('topHeading', 'topHeadingUnderline')
  //metricsToggler()
  //copyValue(document.querySelectorAll('#shareTranscript'))
  //positionChevron()
}

/**
 * var fundata = [
  { name: 'Transcription', count: 134, color: randomColor(0.4) },
  { name: 'Editing', count: 15, color: randomColor(0.4) },
  { name: 'Merging', count: 1, color: randomColor(0.4) }
]
 */

/**
 * 
 * @param {*} data 
 */

function copyToClipboard (data) {
  navigator.clipboard.writeText(data)
}

function metricsToggler () {
  var metricsDiv = document.getElementById('metricsDiv')
  var exportDiv = document.getElementById('exportDiv')
  var textSpan = document.getElementById('showHideMetrics')
  if(projectMetrics[projectMetrics.length - 2].count != 100.00){
    metricsDiv.classList.remove('hidden')
    metricsDiv.classList.add('my-8')
    exportDiv.classList.add('hidden')
  }
  else{
    metricsDiv.classList.add('hidden')
    exportDiv.classList.remove('hidden')
    metricsDiv.classList.remove('my-8')
  }
  if (metricsShowing()) {
    textSpan.text = 'Hide metrics'
    document.getElementById('metricsToggle').checked = true
  } else {
    textSpan.text = 'Show metrics'
  }
  document.getElementById('metricsToggle').addEventListener(
    'click',
    e => {
      var value = e.target.checked
      if (value) {
        metricsDiv.classList.remove('hidden')
        exportDiv.classList.add('my-12')
        textSpan.textContent = 'Hide metrics'
      } else {
        metricsDiv.classList.add('hidden')
        exportDiv.classList.remove('my-12')
        textSpan.textContent = 'show metrics'
      }
    },
    true
  )
}

function positionChevron(){
  var chevrons=[document.getElementById('backChevron'),document.getElementById('forwardChevron')]
  var screenHeight=document.getElementById('mainElement').clientHeight
  chevrons.forEach(chevron=>{
    chevron.style.top =screenHeight/2 +'px'
    //chevron.style.zIndex=00
    console.log(document.scrollingElement.scrollHeight)
    console.log(chevron)
  })
}

function metricsShowing () {
  var metricsDiv = document.getElementById('metricsDiv')
  if (metricsDiv.classList.contains('hidden')) {
    return false
  }
  return true
}

function navigateTo (urlHash) {
  var link = document.createElement('a')
  link.href = urlHash
  //link.click()
}

function copyValue (elements) {
  for (let index = 0; index < elements.length; index++) {
    const element = elements[index];
    element.addEventListener('click', (e) => {
      if (e.target.nodeName == 'INPUT') {
        var el = e.target
        var value = el.value
        el.startSelection = 0
        el.endSelecttion = value.length
        el.select()
        copyToClipboard(value)
      }
    })
  }
}
var dat = [
  { name: 'Transcription', count: 134, color: 'rgba(233,160,186,0.4)' },
  { name: 'Editing', count: 15, color: 'rgba(63,193,52,0.4)' },
  { name: 'Merging', count: 1, color: 'rgba(80,43,196,0.4)' }
]

var chevronData=['transcripts','captions','subtitles']
