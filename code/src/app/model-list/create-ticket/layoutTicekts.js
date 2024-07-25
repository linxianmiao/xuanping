import React, { Component } from 'react'
import { Card, Row } from '@uyun/components'
import { withRouter } from 'react-router-dom'
import { observer, inject } from 'mobx-react'
import ITSMCard from './card'
@inject('modelListStore')
@withRouter
@observer
class CreateLayoutModel extends Component {
  state = {
    loading: true,
    list: []
  }

  handleClick = model => {
    this.props.handleChange(false)
    this.props.history.push({
      pathname: `/ticket/createTicket/${model.processId}`
    })
  }

  componentDidMount() {
    this.getModelList()
  }

  getModelList = async () => {
    const list = await this.props.modelListStore.getLayoutModelList() || []
    this.setState({ loading: false, list })
  }

  render() {
    const { list } = this.state
    return (
      <div className="tickets-wrap old">
        {_.map(list, models => {
          return (
            <Card
              bodyStyle={{ padding: 0 }}
              bordered={false}
              key={models.layoutName}
              title={models.layoutName}>
              <Row>
                {_.map(models.models, modal => {
                  const { processName, iconName, fileId, processId, fileName, sharedBusinessUnitName } = modal
                  const imgurl = `${API.DOWNLOAD}/${fileId}/${fileName}`
                  return (
                    <ITSMCard
                      style={{ width: 238 }}
                      key={processId}
                      imgurl={imgurl}
                      id={processId}
                      modal={modal}
                      name={processName}
                      icon={iconName}
                      sharedBusinessUnitName={sharedBusinessUnitName}
                      handleClick={this.handleClick} />
                  )
                })}
              </Row>
            </Card>
          )
        })}
      </div>
    )
  }
}

export default CreateLayoutModel