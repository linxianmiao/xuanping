import React from 'react'
import { Switch } from 'react-router-dom'
import PermissionRoute from '../components/menuPermission'

import RuleManagement from './index'
import HandlerRuleEdit from './HandlerRuleEdit'

export default function Main() {
  return (
    <Switch>
      <PermissionRoute exact path="/conf/handleRule" component={RuleManagement} />
      <PermissionRoute exact path="/conf/handleRule/create" component={HandlerRuleEdit} />
      <PermissionRoute exact path="/conf/handleRule/detail/:id" component={HandlerRuleEdit} />
    </Switch>
  )
}
