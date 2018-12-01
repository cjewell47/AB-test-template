/*
* @Author: Charles Jewell (Charles Jewell)
* @Last Modified by:   Charles Jewell
*/

/* globals mboxTrack */

import './styles/main.less'

import html from './templates/main.html'

const ns = process.env.RFC_NAMESPACE
const env = process.env.NODE_ENV
const useNPMjQuery = process.env.NPM_JQUERY
const domDependancies = [
  'body'
]

// Script entry
console.group()
console.info('RFC: %s', ns)
console.info('ENV: %s', env)
var _counter = 8000;
function _check() {
  if(document.querySelector('.swiper-pagination span') || document.querySelector('.swiper-pagination-switch')) {
    init()
  } else {
    _counter = _counter - 50;
    if (_counter > 50) {
      setTimeout(() => {
        _check();
      }, 50)
    }
  }
}

_check()
console.groupEnd()

/**
* Primary function to begin module execution - runs after Polling complete
* @return {void} - return not necessary
*/
function init () {
  console.log('INIT: %s', ns)

  document.querySelector('body').classList.add(ns + '-body')

  var removeCl = el => {
    el.className = el.className.replace(/\bactive\b/g, "")
  }

  var cont = document.querySelector('.image-slider-container') || document.querySelector('.image-swiper-container')
  cont.parentNode.classList.add(ns + '-container')
  cont.insertAdjacentHTML('beforebegin', html({ns}))

  var dots = [].slice.call(document.querySelectorAll('.swiper-pagination span, .swiper-pagination-switch')),
  arrows = [].slice.call(document.querySelectorAll('.swiper-button-next, .swiper-button-prev, a.arrow-left, a.arrow-right')),
  dressImages = [].slice.call(document.querySelectorAll('.product__image-slider .swiper-wrapper .swiper-slide[data-swiper-slide-index], .swiper-container .swiper-slide.image-slide'))

  console.log(dressImages);

  dressImages.forEach(dressImage => {
    if (!dressImage.classList.contains('swiper-slide-duplicate')) {
      document.querySelector('#' + ns).insertAdjacentHTML('beforeend', dressImage.outerHTML)
    }
  })

  document.querySelectorAll('#' + ns + ' .swiper-slide')[0].classList.add('active')

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      removeCl(document.querySelector('#' + ns + ' .swiper-slide.active'))
      document.querySelectorAll('#' + ns + ' .swiper-slide')[index].classList.add('active')
    })
  })

  arrows.forEach(arrow => {
    arrow.addEventListener('click', () => {
      console.log(document.querySelector('#' + ns + ' .swiper-slide.active'));
      removeCl(document.querySelector('#' + ns + ' .swiper-slide.active'))
      setTimeout(() => {
        var ind = checkActive()
        document.querySelectorAll('#' + ns + ' .swiper-slide')[ind].classList.add('active')
      },100)
    })
  })

  var sideBar = [].slice.call(document.querySelectorAll('#' + ns + ' .swiper-slide img'))
  sideBar.forEach((img, index) => {
    img.addEventListener('click', () => {
      document.querySelectorAll('.swiper-pagination span, .swiper-pagination-switch')[index].click()
    })
  })

  var checkActive = () => {
    var currentDots = [].slice.call(document.querySelectorAll('.swiper-pagination span, .swiper-pagination-switch'))
    var ind
    currentDots.forEach((currentDot, index) => {
      if (currentDot.classList.contains('swiper-pagination-bullet-active') || currentDot.classList.contains('swiper-active-switch')) {
        ind = index
      }
    })
    return ind
  }


  document.querySelector('body').style.display = 'block'
}
