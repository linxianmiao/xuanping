import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { inject } from '@uyun/core'
import { Button, Modal, Row, Card, Spin } from '@uyun/components'
import { TicketlistStore } from '../../ticketlist.store'
import styles from '../../ticketlist.module.less'
import { API } from '../../api/request/config'
@observer
class CreateTicket extends Component {
  @inject('i18n') i18n

  @inject(TicketlistStore) store

  @inject('widget') widget

  constructor(props, context) {
    super(props, context)

    if (this.widget) {
      this.windowWin = this.widget.getContextWindow()
    }
  }

  state = {
    visible: false,
    loading: false
  }

  handleClick = async (visible) => {
    if (visible) {
      this.setState({ visible, loading: true })
      await this.store.getModelInLayoutByUser()
      this.setState({ loading: false })
    } else {
      this.setState({ visible })
    }
  }

  render() {
    const { modelInLayoutByUser } = this.store
    const { visible, loading } = this.state
    const w = this.windowWin || window
    return (
      <React.Fragment>
        <Button type="primary" onClick={this.handleClick} style={{ marginLeft: 16 }}>
          {this.i18n('create.ticket', '创建工单')}
        </Button>
        <Modal
          maskClosable
          title={this.i18n('create.ticket', '创建工单')}
          footer={null}
          width={800}
          visible={visible}
          onCancel={() => this.handleClick(false)}
          getContainer={() => w.document.body}
        >
          {loading ? (
            <div className={styles.createTicketSpin}>
              <Spin />
            </div>
          ) : (
            <div>
              {_.map(modelInLayoutByUser, (models) => {
                return (
                  <Card
                    bodyStyle={{ padding: 0 }}
                    bordered={false}
                    key={models.layoutName}
                    title={models.layoutName}
                  >
                    <Row>
                      {_.map(models.models, (modal) => {
                        const { processName, iconName, fileId, processId, fileName } = modal
                        return (
                          <div className={styles.createTicketCardList} key={processId}>
                            <div
                              className={styles.createTicketCardItem}
                              onClick={() => {
                                this.handleClick(false)
                                this.props.handleDetailTicket(modal, 'create')
                              }}
                            >
                              {iconName === 'define' ? (
                                <img src={`${API}/file/downloadFile/${fileId}/${fileName}`} />
                              ) : (
                                <i className={`iconfont icon-${iconName}`} />
                              )}
                              <span className="process-name-wrap">{processName}</span>
                            </div>
                          </div>
                        )
                      })}
                    </Row>
                  </Card>
                )
              })}
            </div>
          )}
        </Modal>
      </React.Fragment>
    )
  }
}

export default CreateTicket
