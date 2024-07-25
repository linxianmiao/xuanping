import React from 'react'
import { Switch, Route } from 'react-router-dom'
import PermissionRoute from '../components/menuPermission'

import TriggerList from './index'
import TriggerEdit from '../TriggerEdit2'
import TriggerLogList from './logList'

export default function Main() {
  return (
    <Switch>
      <PermissionRoute menuCode="trigger" exact path="/conf/trigger" component={TriggerList} />
      <PermissionRoute
        exact
        path="/conf/trigger/triggerRecord/:triggerId"
        component={TriggerLogList}
      />
      <Route exact path="/conf/trigger/detail/:id" component={TriggerEdit} />
      <Route exact path="/conf/trigger/create" component={TriggerEdit} />
    </Switch>
  )
}
