import React from 'react'
import { Switch } from 'react-router-dom'
import PermissionRoute from '../components/menuPermission'
import System from './index'
import MatrixTemplate from './matrixTemplate'
import AppAccessEdit from './AppAccess/Edit'

export default function Main() {
  return (
    <Switch>
      <PermissionRoute exact path="/sysCon/matrixTemplate/create" component={MatrixTemplate} />
      <PermissionRoute exact path="/sysCon/matrixTemplate/detail/:id" component={MatrixTemplate} />
      <PermissionRoute exact path="/sysCon/matrixTemplate/copy/:id" component={MatrixTemplate} />
      <PermissionRoute exact path="/sysCon/appAccess/:appCode" component={AppAccessEdit} />
      <PermissionRoute menuCode="sysCon" exact path="/sysCon/:type" component={System} />
    </Switch>
  )
}
