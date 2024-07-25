/* eslint-disable no-undef */
import 'systemjs'
import 'systemjs/dist/extras/amd'
import React from 'react'
import reactDOM from 'react-dom'
import * as reactRouter from 'react-router'
import * as reactRouterDom from 'react-router-dom'

System.addImportMap({
  imports: {
    react: 'app:react',
    'react-dom': 'app:react-dom',
    'react-router': 'app:react-router',
    'react-router-dom': 'app:react-router-dom'
  }
})
System.set('app:react', React)
System.set('app:react-dom', reactDOM)
System.set('app:react-router', reactRouter)
System.set('app:react-router-dom', reactRouterDom)
