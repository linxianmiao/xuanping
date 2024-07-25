import React from 'react'
import { Switch } from 'react-router-dom'
import PermissionRoute from '../components/menuPermission'
import DatabaseList from './index'
import CreateDataBase from './createDataBase'
import EditDataBase from './editDataBase'

export default function Main() {
  return (
    <Switch>
      <PermissionRoute exact path="/conf/database" component={DatabaseList} />
      <PermissionRoute exact path="/datatable/:appkey" component={DatabaseList} />
      <PermissionRoute exact path="/datatable/create/:appkey" component={CreateDataBase} />
      <PermissionRoute exact path="/datatable/edit/:id/:appkey" component={EditDataBase} />
      <PermissionRoute exact path="/conf/database/create" component={CreateDataBase} />
      <PermissionRoute exact path="/conf/database/edit/:id" component={EditDataBase} />
    </Switch>
  )
}
