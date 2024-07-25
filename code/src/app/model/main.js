import React, { lazy } from 'react'
import { Switch } from 'react-router-dom'
import PermissionRoute from '../components/menuPermission'

import Model from './index'
import CreateModel from '../create-model'
import ModelList from '../model-list'
import ModelApprovalRecord from '../model-list/modelApprovalRecord'
import CreateAgileModel from '../create-agileModel'
import { qs } from '@uyun/utils'

const CreateField = lazy(() => import('../create-field'))

export default function Main(props) {
  const { appkey } = qs.parse(props.location.search)
  // window.LOWCODE_APP_KEY = appkey

  return (
    <Switch>
      <PermissionRoute menuCode="model" exact path="/conf/model" component={ModelList} />
      <PermissionRoute exact path="/conf/model/approval" component={ModelApprovalRecord} />
      <PermissionRoute exact path="/conf/model/create" component={CreateAgileModel} />
      <PermissionRoute exact path="/conf/model/copy/:id" component={CreateAgileModel} />
      <PermissionRoute exact path="/conf/model/edie/:id" component={CreateAgileModel} />
      <PermissionRoute exact path="/conf/model/advanced/:id" component={Model} />
      <PermissionRoute exact path="/conf/model/advancedCreate" component={CreateModel} />
      <PermissionRoute exact path="/conf/model/advanced/field/create" component={CreateField} />
      <PermissionRoute
        exact
        path="/conf/model/advanced/field/update/:type"
        component={CreateField}
      />
    </Switch>
  )
}
