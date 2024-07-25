import React, { Component } from 'react'
import QueueAnim from 'rc-queue-anim'

class SideNodeModal extends Component {
  onCancelShow = () => {
    this.props.onCancelShow()
  }

  render() {
    const { show } = this.props
    return (
      <QueueAnim className="side-node-modal-wrap">
        {show && (
          <div className="side-node-modal-tips">
            <div className="header">
              <span className="side-node-close">
                <i className="iconfont icon-cha" onClick={this.onCancelShow} />
              </span>
            </div>
            <div className="side-node-content">
              <div>{i18n('sideNodeTip', '节点说明')}</div>
              <ul>
                <li>
                  {i18n('sideNodeTip1', '1、开始： 代表流程开始的入口，需配置新建流程时使用的表单')}
                </li>
                <li>
                  {i18n('sideNodeTip2', '2、结束： 代表流程结束的标示，需配置流程结束时查看的表单')}
                </li>
                <li>{i18n('sideNodeTip3', '3、人工： 需要人员参与处理和审批的流程节点')}</li>
                <li>{i18n('sideNodeTip4', '4、自动： 执行自动化的流程节点')}</li>
                <li>{i18n('sideNodeTip5', '5、子流程： 执行子流程的流程节点')}</li>
                <li>{i18n('sideNodeTip6', '6、判断： 通过条件配置实现动态流转的流程网关')}</li>
                <li>{i18n('sideNodeTip7', '7、同步： 标记同步并行的任务节点')}</li>
                <li>{i18n('sideNodeTip8', '8、定时器：支持指定时间或间隔时间定时执行')}</li>
                <li>
                  {i18n(
                    'sideNodeTip9',
                    '9、自动交付：持续交付自动化对接的实现方式，将会自动或手动触发自动化执行'
                  )}
                </li>
                <li>{i18n('sideNodeTip10', '10、包容：根据判断条件计算同步并行任务')}</li>
              </ul>
              <div className="side-node-line" />
              <div>{i18n('sideOperationTip', '操作说明')}</div>
              <ul>
                <li>
                  {i18n(
                    'sideOperationTip1',
                    '1、 添加节点：选中需要的节点类型后拖拽到画布相应位置'
                  )}
                </li>
                <li>
                  {i18n('sideOperationTip2', '2、 删除节点：选中目标节点后，按"delete"键进行删除')}
                </li>
                <li>
                  {i18n(
                    'sideOperationTip3',
                    '3、 编辑节点：双击目标节点后，侧滑出对应的属性面板，可直接进行编辑'
                  )}
                </li>
                <li>
                  {i18n(
                    'sideOperationTip4',
                    '4、 批量选中：按住"ctrl"键然后逐个选中目标节点，或按住鼠标左键拖动选择，均能批量选中多个节点'
                  )}
                </li>
                <li>
                  {i18n(
                    'sideOperationTip5',
                    '5、 连线：确定好连线的源节点和目标节点后，选择源节点四周的连线标记并拖拽引出连线到目标节点'
                  )}
                </li>
                <li>
                  {i18n(
                    'sideOperationTip6',
                    '6、 画布收缩：点击工具栏的百分比或放大缩小按钮即可对画布进行收缩控制，点击全屏按钮进入全屏，按"Esc"键退出全屏'
                  )}
                </li>
                <li>
                  {i18n(
                    'sideOperationTip7',
                    '7、 布局：选中节点后按住左键并拖拽可以实现节点位置配置，选中多个节点后点击工具栏的布局按钮可以快速布局'
                  )}
                </li>
                <li>
                  {i18n('sideOperationTip8', '8、 撤销：按住"ctrl"+"z"组合键实现流程图操作的撤销')}
                </li>
              </ul>
            </div>
          </div>
        )}
      </QueueAnim>
    )
  }
}

export default SideNodeModal
