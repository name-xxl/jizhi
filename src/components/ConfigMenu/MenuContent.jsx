import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  Pane,
  Menu,
  Tablist,
  Switch,
  SidebarTab,
  SegmentedControl,
  Spinner,
  Text,
  InlineAlert,
  TextInput,
  Button,
} from 'evergreen-ui';
import styled from 'styled-components';
import { WAVES, DEFAULT_ENGINES } from '../../constants/appConstants';
import Legal from './Legal';
import FontStatement from './FontStatement';
import SaveBgMenuItem from './SaveBgMenuItem';

const SwitchWrapper = styled.div`
  display: flex;
  justify-content: space-between;
`;

const SegmentedControlWrapper = styled.div`
  margin-left: 16px;
`;

const MenuContent = (props) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [engineUrl, setEngineUrl] = useState('');
  const [engineName, setEngineName] = useState('');
  const engineInputRef = useRef(null);

  const { isRecordingHotkey, onSaveHotkey } = props;

  // 在菜单内监听键盘事件，用于录制热键
  const handleMenuKeyDown = (e) => {
    if (!isRecordingHotkey) return;
    // 忽略单独的修饰键
    if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) {
      return;
    }
    // 阻止事件冒泡，避免触发其他快捷键
    e.preventDefault();
    e.stopPropagation();
    // 保存热键并退出录制模式
    const newHotkey = {
      key: e.key,
      keyCode: e.keyCode,
    };
    // 调用父组件的保存逻辑
    if (onSaveHotkey) {
      onSaveHotkey(newHotkey);
    }
  };

  const {
    isPlaying,
    onPlayPauseSelect,
    showSearchBarChecked,
    onShowSearchBarChange,
    centerSearchBarChecked,
    onCenterSearchBarChange,
    searchHotkey,
    onStartRecordHotkey,
    onCancelRecordHotkey,
    customEngines,
    isAddingEngine,
    onAddCustomEngine,
    onDeleteCustomEngine,
    onStartAddEngine,
    onCancelAddEngine,
    defaultPlayChecked,
    verticalVersesChecked,
    onVerticalVersesChange,
    onDefaultPlayChange,
    colorStayChecked,
    onColorStayChange,
    selected,
    onBgOptionChange,
    engineOption,
    onEngineOptionChange,
    colorMode,
    onColorModeOptionChange,
    fontName,
    onFontTypeChange,
    isFontLoading,
    waveColor,
  } = props;

  const bgOptions = [
    { label: 'Waves', value: 'waves' },
    { label: 'Blobs', value: 'blobs' },
  ];

  const allEngines = [
    ...DEFAULT_ENGINES,
    ...customEngines.map((e, i) => ({ ...e, customIndex: i })),
  ];

  const handleSaveEngine = () => {
    if (!engineUrl || !engineName) return;
    // 直接保存原始 URL，搜索时会将 test 替换为用户输入
    onAddCustomEngine({ label: engineName, value: engineUrl });
    setEngineUrl('');
    setEngineName('');
  };

  const colorModeOptions = [
    {
      label: '白天',
      value: 'light',
    },
    {
      label: '黑夜',
      value: 'dark',
    },
    {
      label: '跟随系统',
      value: 'os',
    },
  ];

  const fontOptions = [
    { label: '江西拙楷', value: 'JXZhuoKai' },
    { label: '欣意吉祥宋', value: 'JiXiangSong' },
    { label: '方正细金陵', value: 'FZXiJinLJW' },
  ];

  const switchOptions = [
    // {
    //   name: '黑夜模式',
    //   checkedState: darkModeChecked,
    //   onChangeFunc: onDarkModeChange,
    // },
    {
      name: '竖版诗词',
      checkedState: verticalVersesChecked,
      onChangeFunc: onVerticalVersesChange,
    },
    {
      name: '默认播放动画',
      checkedState: defaultPlayChecked,
      onChangeFunc: onDefaultPlayChange,
    },
    {
      name: '常驻显示搜索框',
      checkedState: showSearchBarChecked,
      onChangeFunc: onShowSearchBarChange,
    },
    {
      name: '搜索框居中',
      checkedState: centerSearchBarChecked,
      onChangeFunc: onCenterSearchBarChange,
    },
    {
      name: '保留颜色名称',
      checkedState: colorStayChecked,
      onChangeFunc: onColorStayChange,
    },
  ];

  const tabs = [
    {
      tabName: '设置',
      tabContent: (
        <>
          <Menu.Group title="偏好">
            {switchOptions.map((option) => {
              if (selected !== WAVES && option.name === '保留颜色名称') return;
              return (
                <Menu.Item key={option.name}>
                  <SwitchWrapper>
                    {option.name}
                    <Switch checked={option.checkedState} onChange={option.onChangeFunc} />
                  </SwitchWrapper>
                </Menu.Item>
              );
            })}
          </Menu.Group>
          <Menu.Divider />

          <Menu.Group title="搜索引擎">
            <SegmentedControlWrapper>
              <SegmentedControl
                width={280}
                options={allEngines}
                value={engineOption}
                onChange={onEngineOptionChange}
              />
            </SegmentedControlWrapper>
            {customEngines.length > 0 && (
              <Pane marginLeft={16} marginTop={8}>
                <Text size={300} color="muted">
                  自定义引擎：
                </Text>
                {customEngines.map((engine, index) => (
                  <Pane key={index} display="flex" alignItems="center" marginTop={4}>
                    <Text size={300}>{engine.label}</Text>
                    <Button
                      icon="cross"
                      size="small"
                      intent="danger"
                      marginLeft={8}
                      onClick={() => onDeleteCustomEngine(index)}
                    >
                      删除
                    </Button>
                  </Pane>
                ))}
              </Pane>
            )}
            {isAddingEngine ? (
              <Pane marginLeft={16} marginRight={16} marginTop={12}>
                <Text size={300} color="muted" marginBottom={4}>
                  1. 在目标搜索引擎搜索 &quot;test&quot;
                  <br />
                  2. 复制地址栏网址粘贴到下方
                </Text>
                <TextInput
                  ref={engineInputRef}
                  placeholder="引擎名称"
                  value={engineName}
                  onChange={(e) => setEngineName(e.target.value)}
                  marginBottom={8}
                  width={280}
                />
                <TextInput
                  placeholder="粘贴包含 test 的搜索网址"
                  value={engineUrl}
                  onChange={(e) => setEngineUrl(e.target.value)}
                  marginBottom={8}
                  width={280}
                />
                <Pane display="flex" gap={8}>
                  <Button intent="success" onClick={handleSaveEngine}>
                    保存
                  </Button>
                  <Button onClick={onCancelAddEngine}>取消</Button>
                </Pane>
              </Pane>
            ) : (
              <Menu.Item icon="plus" onSelect={onStartAddEngine} marginTop={8}>
                添加自定义搜索引擎
              </Menu.Item>
            )}
          </Menu.Group>
          <Menu.Divider />
          <Menu.Group title="搜索框热键">
            <Pane marginLeft={16} marginRight={16} marginBottom={8}>
              {isRecordingHotkey ? (
                <Pane
                  height={32}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  background="yellowTint"
                  borderRadius={4}
                  padding={8}
                  onKeyDown={handleMenuKeyDown}
                >
                  <Text color="warning">请按下想要设置的热键...</Text>
                </Pane>
              ) : (
                <Pane display="flex" alignItems="center" justifyContent="space-between">
                  <Text>{searchHotkey ? searchHotkey.key.toUpperCase() : '未设置'}</Text>
                  <Menu.Item icon="edit" onSelect={onStartRecordHotkey} intent="none">
                    修改
                  </Menu.Item>
                </Pane>
              )}
              {isRecordingHotkey && (
                <Menu.Item
                  icon="cross"
                  onSelect={onCancelRecordHotkey}
                  intent="danger"
                  marginTop={8}
                >
                  取消录制
                </Menu.Item>
              )}
            </Pane>
          </Menu.Group>
        </>
      ),
    },
    {
      tabName: '背景',
      tabContent: (
        <>
          <Menu.Group title="动画效果">
            <Menu.OptionsGroup
              options={bgOptions}
              selected={selected}
              onChange={onBgOptionChange}
            />
          </Menu.Group>
          <Menu.Divider />
          <Menu.Group title="颜色模式">
            <SegmentedControlWrapper>
              <SegmentedControl
                width={280}
                options={colorModeOptions}
                value={colorMode}
                onChange={onColorModeOptionChange}
              />
            </SegmentedControlWrapper>
          </Menu.Group>
        </>
      ),
    },
    {
      tabName: '操作',
      tabContent: (
        <Menu.Group>
          <SaveBgMenuItem />
          <Menu.Item
            icon={isPlaying ? 'pause' : 'play'}
            intent="success"
            onSelect={onPlayPauseSelect}
            secondaryText="Space"
          >
            {isPlaying ? '暂停动画' : '播放动画'}
          </Menu.Item>
          <InlineAlert intent="none" marginRight={15} marginLeft={15}>
            <p>波纹背景下使用左右键可以随机切换颜色</p>
          </InlineAlert>
        </Menu.Group>
      ),
    },

    {
      tabName: '字体',
      tabContent: (
        <Menu.Group title="选择字体">
          <SegmentedControlWrapper>
            <SegmentedControl
              width={280}
              options={fontOptions}
              value={fontName}
              onChange={onFontTypeChange}
            />
            {isFontLoading ? (
              <Pane height={30} width={280} marginBottom={-10} marginTop={10} display="flex">
                <Spinner size={20} marginRight={5} />
                <Text>远程加载中……</Text>
              </Pane>
            ) : (
              <FontStatement fontName={fontName} />
            )}
          </SegmentedControlWrapper>
        </Menu.Group>
      ),
    },
    { tabName: '关于', tabContent: <Legal waveColor={waveColor} selected={selected} /> },
  ];

  return (
    <Pane display="flex" height={300}>
      <Tablist width={80} margin={10}>
        {tabs.map(({ tabName }, index) => (
          <SidebarTab
            key={tabName}
            id={tabName}
            onSelect={() => setSelectedIndex(index)}
            isSelected={index === selectedIndex}
            aria-controls={`panel-${tabName}`}
          >
            {tabName}
          </SidebarTab>
        ))}
      </Tablist>
      <Pane width={350} background="tint1" overflow="auto" maxHeight={300}>
        {tabs.map(({ tabName, tabContent }, index) => (
          <Pane
            key={tabName}
            id={`panel-${tabName}`}
            role="tabpanel"
            aria-labelledby={tabName}
            aria-hidden={index !== selectedIndex}
            display={index === selectedIndex ? 'block' : 'none'}
          >
            {tabContent}
          </Pane>
        ))}
      </Pane>
    </Pane>
  );
};

MenuContent.propTypes = {
  children: PropTypes.any,
  showSearchBarChecked: PropTypes.bool,
  onShowSearchBarChange: PropTypes.func,
  centerSearchBarChecked: PropTypes.bool,
  onCenterSearchBarChange: PropTypes.func,
  searchHotkey: PropTypes.object,
  isRecordingHotkey: PropTypes.bool,
  onStartRecordHotkey: PropTypes.func,
  onCancelRecordHotkey: PropTypes.func,
  onSaveHotkey: PropTypes.func,
  onPlayPauseSelect: PropTypes.func.isRequired,
  onVerticalVersesChange: PropTypes.func.isRequired,
  verticalVersesChecked: PropTypes.bool.isRequired,
  isPlaying: PropTypes.bool.isRequired,
  defaultPlayChecked: PropTypes.bool.isRequired,
  onDefaultPlayChange: PropTypes.func.isRequired,
  colorStayChecked: PropTypes.bool.isRequired,
  onColorStayChange: PropTypes.func.isRequired,
  selected: PropTypes.string,
  onBgOptionChange: PropTypes.func,
  engineOption: PropTypes.string,
  onEngineOptionChange: PropTypes.func,
  customEngines: PropTypes.array,
  isAddingEngine: PropTypes.bool,
  onAddCustomEngine: PropTypes.func,
  onDeleteCustomEngine: PropTypes.func,
  onStartAddEngine: PropTypes.func,
  onCancelAddEngine: PropTypes.func,
  colorMode: PropTypes.string,
  onColorModeOptionChange: PropTypes.func,
  fontName: PropTypes.string,
  onFontTypeChange: PropTypes.func,
  isFontLoading: PropTypes.bool,
  waveColor: PropTypes.object,
};

export default MenuContent;
