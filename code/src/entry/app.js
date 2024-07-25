import React, { lazy, Suspense } from 'react'
import { HashRouter, Redirect, Route, Switch } from 'react-router-dom'
import { store as runtimeStore } from '@uyun/runtime-react'
import { LocaleProvider } from '@uyun/components'
import enUS from '@uyun/components/es/locale-provider/en_US'
import zhCN from '@uyun/components/es/locale-provider/zh_CN'

import LeaveNotifyModal from '../app/components/leaveNotifyModal'
import PermissionRoute from '../app/components/menuPermission'
import Layout from '../app/components/layout'

import CreateTicket from '../app/create-ticket'

import Overview from '../app/overview'
import TicketList from '../app/list'
import BatchTicket from '../app/list/batchTicket'
import CreateService from '../app/service'
import DraftsList from '../app/drafts'

import TicketChange from '../app/ticketChange'
import RemoteList from '../app/RemoteList'
import Remote from '../app/Remote'
import Details from '../app/details'

import IframeComponent from '../app/iframeComponent' // 不太清楚这是干啥的 hange
import IframeCreateTicket from '../app/iframePage/createTicket'
import DataBaseTable from '../app/dataBaseTable/main'
// import AppTicketList from '../app/iframePage/appTicketList'
// import AppModelList from '../app/iframePage/ModellistApp'
// import AppTriggerList from '../app/iframePage/appTriggerList'
// import AppTodoList from '../app/iframePage/appTodoList'

//应用接入相关iframe页面改为懒加载;
const AppTicketList = lazy(() => import('../app/iframePage/appTicketList'))
const AppModelList = lazy(() => import('../app/iframePage/ModellistApp'))
const AppTriggerList = lazy(() => import('../app/iframePage/appTriggerList'))
const AppTodoList = lazy(() => import('../app/iframePage/appTodoList'))

const CreateField = lazy(/* webpackChunkName: "createField" */ () => import('../app/create-field')) // 新建字段
const FieldList = lazy(/* webpackChunkName: "field-list" */ () => import('../app/field-list')) // 字段管理
const FormManagement = lazy(
  /* webpackChunkName: "form-management" */ () => import('../app/form-management')
) // 子表单管理
const Entrust = lazy(() => import(/* webpackChunkName: "entrust" */ '../app/entrust/main')) //  委托
// const Rule = lazy(() => import(/* webpackChunkName: "rule" */ '../app/RuleManagement/main')) // 处理人规则
const Trigger = lazy(() => import(/* webpackChunkName: "trigger" */ '../app/trigger-list/main')) // 触发器管理
const Sla = lazy(() => import(/* webpackChunkName: "sla" */ '../app/sla-list/main')) // sla 管理
const System = lazy(() => import(/* webpackChunkName: "system" */ '../app/system/main')) // 设置
const Model = lazy(() => import(/* webpackChunkName: "model" */ '../app/model/main')) // 模型管理

const Authority = lazy(() => import(/* webpackChunkName: "authority" */ '../app/authority')) // 权限
export default class App extends React.Component {
  render() {
    return (
      <LocaleProvider locale={runtimeStore.getState().language !== 'zh_CN' ? enUS : zhCN}>
        <HashRouter getUserConfirmation={LeaveNotifyModal}>
          <Layout>
            <Suspense fallback={() => null}>
              <Switch>
                <PermissionRoute path="/conf/database" component={DataBaseTable} />
                <PermissionRoute path="/datatable" component={DataBaseTable} />
                <PermissionRoute
                  menuCode="hasChangeAuth"
                  exact
                  path="/ticketChange"
                  component={TicketChange}
                />

                <PermissionRoute path="/create/:id/:url" component={IframeCreateTicket} />
                <PermissionRoute path="/asset/drafts/:id" component={IframeCreateTicket} />
                <PermissionRoute path="/iframe/:code" component={IframeComponent} />
                <PermissionRoute
                  menuCode="remoteConfig"
                  exact
                  path="/conf/remote"
                  component={Remote}
                />
                <PermissionRoute exact path="/remote" component={RemoteList} />

                <Redirect exact from="/" to="/ticket/pandect/default" />
                <Redirect exact from="/ticket/pandect" to="/ticket/pandect/default" />
                <PermissionRoute
                  menuCode="pandect"
                  exact
                  path="/ticket/pandect/:type"
                  component={Overview}
                />

                <Redirect exact from="/ticket" to="/ticket/myToDo" />
                <PermissionRoute exact path="/ticketDetail/:id" component={Details} />
                <PermissionRoute exact path="/ticket/detail/:id" component={Details} />
                <PermissionRoute exact path="/detail/:id" component={Details} />
                <PermissionRoute
                  exact
                  pageType="public"
                  path="/create/:id/:url"
                  component={CreateTicket}
                />
                <PermissionRoute exact path="/ticket/createTicket/:id" component={CreateTicket} />
                <PermissionRoute exact path="/ticket/drafts/:id" component={CreateTicket} />
                <PermissionRoute exact path="/ticket/createService/:id" component={CreateService} />

                <PermissionRoute
                  menuCode="drafts"
                  exact
                  path="/ticket/draftsList"
                  component={DraftsList}
                />
                <PermissionRoute
                  menuCode="isShowBatch"
                  exact
                  path="/ticket/batchTicket/:type"
                  component={BatchTicket}
                />
                <PermissionRoute
                  menuCode="customize"
                  exact
                  path="/ticket/:type"
                  component={TicketList}
                />

                <PermissionRoute exact path="/conf/formManagement" component={FormManagement} />
                <PermissionRoute menuCode="field" exact path="/conf/field" component={FieldList} />
                <PermissionRoute exact path="/conf/field/create" component={CreateField} />
                <PermissionRoute path="/conf/field/update/:type" component={CreateField} />

                <Route path="/conf/entrust" component={Entrust} />
                <Route path="/conf/trigger" component={Trigger} />
                <Redirect exact from="/conf/sla" to="/conf/sla/policy" />
                <Route path="/conf/sla" component={Sla} />
                <Redirect exact from="/conf" to="/conf/model" />
                <Route path="/conf/model/" component={Model} />
                <Redirect exact from="/sysCon" to="/sysCon/global" />
                <Route path="/sysCon" component={System} />
                <Route path="/ticketlist/:appkey" component={AppTicketList} />
                <Route path="/todolist/:appkey" component={AppTodoList} />
                <Route path="/modellist/:appkey" component={AppModelList} />
                <Route path="/triggerlist/:appkey" component={AppTriggerList} />
                <PermissionRoute
                  menuCode="authority"
                  exact
                  path="/authority"
                  component={Authority}
                />
              </Switch>
            </Suspense>
          </Layout>
        </HashRouter>
      </LocaleProvider>
    )
  }
}
