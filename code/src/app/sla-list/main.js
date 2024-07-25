import React from 'react'
import { Switch } from 'react-router-dom'
import PermissionRoute from '../components/menuPermission'
import SLAList from './index'
import PolicyRecordList from './policyRecord'
import CreateDefinition from '../create-definition'
import CreatePolicy from '../create-policy'

export default function Main() {
  return (
    <Switch>
      <PermissionRoute exact path="/conf/sla/policy/create" component={CreatePolicy} />
      <PermissionRoute exact path="/conf/sla/definition/create" component={CreateDefinition} />
      <PermissionRoute path="/conf/sla/policyRecord/:id" component={PolicyRecordList} />
      <PermissionRoute path="/conf/sla/policy/detail/:id" component={CreatePolicy} />
      <PermissionRoute path="/conf/sla/definition/detail/:id" component={CreateDefinition} />
      <PermissionRoute menuCode="sla" path="/conf/sla/:type" component={SLAList} />
    </Switch>
  )
}
