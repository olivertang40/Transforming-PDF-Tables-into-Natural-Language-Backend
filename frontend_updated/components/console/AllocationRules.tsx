
'use client';

import { useState } from 'react';

export default function AllocationRules() {
  const [autoMode, setAutoMode] = useState(true);
  const [strategy, setStrategy] = useState('workload');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [enabledStrategies, setEnabledStrategies] = useState({
    workload: true,
    skill: true,
    timezone: false,
    performance: true
  });

  const allocationStrategies = [
    {
      id: 'workload',
      name: '按工作负载分配',
      description: '优先分配给当前任务较少的标注员'
    },
    {
      id: 'skill',
      name: '按技能匹配分配',
      description: '根据标注员的专业技能进行智能匹配'
    },
    {
      id: 'timezone',
      name: '按时区分配',
      description: '考虑标注员的工作时区进行分配'
    },
    {
      id: 'performance',
      name: '按历史表现分配',
      description: '优先分配给质量评分较高的标注员'
    }
  ];

  const currentRules = [
    {
      id: 1,
      name: '高优先级任务规则',
      condition: '优先级 = 高',
      action: '分配给经验丰富的标注员',
      status: 'active'
    },
    {
      id: 2,
      name: '财务文档规则',
      condition: '文档类型 = 财务报告',
      action: '分配给具有财务背景的标注员',
      status: 'active'
    },
    {
      id: 3,
      name: '工作负载平衡规则',
      condition: '标注员任务数 > 15',
      action: '暂停分配新任务',
      status: 'active'
    },
    {
      id: 4,
      name: '质量保证规则',
      condition: 'QA通过率 < 85%',
      action: '增加QA审核频率',
      status: 'inactive'
    }
  ];

  const annotatorSkills = [
    { name: 'John Smith', skills: ['财务', '报告'], workload: 12, performance: 94.2 },
    { name: 'Sarah Johnson', skills: ['技术', '架构'], workload: 8, performance: 96.8 },
    { name: 'Mike Wilson', skills: ['法律', '合同'], workload: 15, performance: 91.5 },
    { name: 'Emily Davis', skills: ['产品', '规格'], workload: 6, performance: 98.1 }
  ];

  const handleSaveRules = () => {
    setShowSaveModal(true);
    setTimeout(() => {
      setShowSaveModal(false);
    }, 2000);
  };

  const handleStrategyToggle = (strategyId: string) => {
    setEnabledStrategies(prev => ({
      ...prev,
      [strategyId]: !prev[strategyId as keyof typeof prev]
    }));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">任务分配规则</h2>
          <p className="text-sm text-gray-600 mt-1">配置自动任务分配策略和规则</p>
        </div>
        <button
          onClick={handleSaveRules}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 whitespace-nowrap cursor-pointer"
        >
          <i className="ri-save-line w-4 h-4 flex items-center justify-center"></i>
          <span>保存配置</span>
        </button>
      </div>

      {/* Mode Toggle */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">分配模式</h3>
        <div className="flex items-center space-x-6">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="radio"
              checked={autoMode}
              onChange={() => setAutoMode(true)}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <div>
              <div className="font-medium text-gray-900">自动分配</div>
              <div className="text-sm text-gray-500">根据预设规则自动分配任务</div>
            </div>
          </label>
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="radio"
              checked={!autoMode}
              onChange={() => setAutoMode(false)}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <div>
              <div className="font-medium text-gray-900">手动分配</div>
              <div className="text-sm text-gray-500">由项目经理手动分配任务</div>
            </div>
          </label>
        </div>
      </div>

      {autoMode && (
        <>
          {/* Allocation Strategies */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">分配策略</h3>
            <div className="space-y-4">
              {allocationStrategies.map((strategy) => (
                <div key={strategy.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={enabledStrategies[strategy.id as keyof typeof enabledStrategies]}
                      onChange={() => handleStrategyToggle(strategy.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{strategy.name}</div>
                      <div className="text-sm text-gray-500">{strategy.description}</div>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm cursor-pointer">
                    配置
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Current Rules */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">当前规则</h3>
                <button className="text-blue-600 hover:text-blue-700 text-sm cursor-pointer">
                  添加规则
                </button>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {currentRules.map((rule) => (
                <div key={rule.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="font-medium text-gray-900">{rule.name}</div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          rule.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {rule.status === 'active' ? '启用' : '禁用'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">条件:</span> {rule.condition}
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">动作:</span> {rule.action}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-700 text-sm cursor-pointer">
                        编辑
                      </button>
                      <button className="text-gray-600 hover:text-gray-700 text-sm cursor-pointer">
                        {rule.status === 'active' ? '禁用' : '启用'}
                      </button>
                      <button className="text-red-600 hover:text-red-700 text-sm cursor-pointer">
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Annotator Skills Overview */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">标注员技能概览</h3>
          <p className="text-sm text-gray-600 mt-1">用于智能分配的标注员技能和状态</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-900">标注员</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">技能标签</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">当前工作量</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">历史表现</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {annotatorSkills.map((annotator, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {annotator.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <span className="font-medium text-gray-900">{annotator.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-wrap gap-1">
                      {annotator.skills.map((skill, skillIndex) => (
                        <span key={skillIndex} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-900">{annotator.workload} 个任务</span>
                      <div className={`w-2 h-2 rounded-full ${
                        annotator.workload > 12 ? 'bg-red-500' : 
                        annotator.workload > 8 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}></div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-1">
                      <i className={`ri-star-fill w-3 h-3 flex items-center justify-center ${
                        annotator.performance >= 95 ? 'text-green-600' : 
                        annotator.performance >= 90 ? 'text-yellow-600' : 'text-red-600'
                      }`}></i>
                      <span className="text-sm font-medium text-gray-900">{annotator.performance}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <button className="text-blue-600 hover:text-blue-700 text-sm cursor-pointer">
                      编辑技能
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Save Confirmation Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <i className="ri-check-line w-4 h-4 flex items-center justify-center text-green-600"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">配置已保存</h3>
            </div>
            <p className="text-sm text-gray-600">分配规则配置已成功保存并生效</p>
          </div>
        </div>
      )}
    </div>
  );
}
