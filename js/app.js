window.addEventListener('DOMContentLoaded', function() {
  var mgmt = navigator.mozApps.mgmt,
    masterExt = navigator.engmodeExtension || navigator.kaiosExtension || navigator.jrdExtension,
    appListPage = document.getElementById('dynapps'),
    includeSystemRole = true
  
  mgmt.getAll().then(function(rawAppList) {
    var appList = includeSystemRole ? rawAppList : rawAppList.filter(function(app) {
      return !(app.manifest.role === 'system')
    })
    var l = appList.length, p = 0, pageSize = 10, maxPage = ((l / pageSize) | 0)

    function displayPage(num) {
      var startIndex = num * pageSize,
          pagedApps = appList.slice(startIndex, startIndex + pageSize), pl = pagedApps.length,
          i, renderedHTML = ''
      for(i=0;i<pl;i++) {
        var appName = pagedApps[i].manifest.name, displayAppIndex = i,
            realAppIndex = startIndex + i, appStatus = pagedApps[i].enabled
        renderedHTML += '<li data-display-index="' + displayAppIndex + '" data-real-index="' + realAppIndex + '" + data-status="' + appStatus + '">' + appName + '</li>'
      }
      appListPage.innerHTML = renderedHTML
    }

    function toggleApp(appNum) {
      var item = document.querySelector('li[data-display-index="'+appNum+'"]'),
          appIndex = item.dataset.realIndex | 0,
          appRef = appList[appIndex],
          newAppStatus = !appRef.enabled
      mgmt.setEnabled(appRef, newAppStatus)
      window.setTimeout(function() {
        displayPage(p)
      }, 100)
    }

    window.addEventListener('keydown', function(e) {
      switch(e.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'SoftLeft':
          p -= 1
          if(p < 0) p = 0
          displayPage(p)
          break
        case 'ArrowRight':
        case 'ArrowDown':
        case 'SoftRight':
          p += 1
          if(p > maxPage) p = maxPage
          displayPage(p)
          break
        case '0':
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
          toggleApp(Number(e.key))
          break
        case '#':
          if(window.confirm('This will normally prompt you to reboot the phone, but since \\
          the engmode-extension permission is removed, you\'ll have to do it by yourself.\n \\
          Once you\'ve made sure of all changes, press OK (the RSK one) to save them, close the app, \\
          hold down the Power button and restart the device.\nSave changes?'))
            masterExt.setPropertyValue('sys.powerctl', 'reboot')
          break
        default:
          break
      }
    }, false)

    displayPage(p)

  })
}, false)
