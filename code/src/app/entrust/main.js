import React from 'react'
import { Switch } from 'react-router-dom'
import PermissionRoute from '../components/menuPermission'

import Entrust from './index'
import EntrustAdd from './EntrustAdd'
import AddForceEntrust from './EntrustForceAdd'

export default function Main() {
  return (
    <Switch>
      <PermissionRoute exact path="/conf/entrust" component={Entrust} />
      <PermissionRoute exact path="/conf/entrust/create" component={EntrustAdd} />
      <PermissionRoute exact path="/conf/entrust/create-force" component={AddForceEntrust} />
    </Switch>
  )
}
