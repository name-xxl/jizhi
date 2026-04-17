import React, { useEffect, useRef } from 'react';
import { Icon } from 'evergreen-ui';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components';

const SearchForm = styled.form`
  position: absolute;
  top: 20px;
  display: flex;
  align-items: center;
  opacity: ${(props) => (props.visible ? 0.4 : 0)};
  pointer-events: ${(props) => (props.visible ? 'auto' : 'none')};
  transition: opacity 300ms ease, transform 300ms ease;
  transform: translateY(${(props) => (props.visible ? 0 : -20)}px);

  ${(props) =>
    props.centered
      ? css`
          left: 50%;
          transform: translateX(-50%) translateY(${(props) => (props.visible ? 0 : -20)}px);
        `
      : css`
          left: 30px;
        `}
`;

const Input = styled.input`
  outline: none;
  border: none;
  background-color: transparent;
  box-shadow: none;
  width: 150px;
  font-size: 16px;
  color: ${(props) => (props.isDarkMode ? '#fff' : '#000')};
  margin-left: -25px;
  padding-left: 35px;
  height: 40px;
  border-bottom: 2px ${(props) => (props.isDarkMode ? '#dbdbdb' : ' #242424 ')} solid;
  opacity: 0;

  &:hover {
    opacity: 0.4;
  }
  &.active {
    opacity: 0.8;
  }
`;

const SearchInput = (props) => {
  const { engineOption, value, focused, onFocus, onBlur, onChange, isDarkMode, centered, visible } =
    props;
  const inputRef = useRef(null);
  const iconColor = isDarkMode ? 'white' : null;

  useEffect(() => {
    if (visible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [visible]);

  // 判断是否为默认引擎（Google/Baidu/Bing）
  const isDefaultEngine =
    engineOption.includes('google.com') ||
    engineOption.includes('baidu.com') ||
    engineOption.includes('bing.com');

  // 处理搜索引擎 URL
  const getFormAction = () => {
    if (isDefaultEngine) {
      // 默认引擎：提取基础 URL
      return engineOption.split('?')[0];
    }
    // 自定义引擎：提取 ? 前面的部分作为基础 URL
    const queryIndex = engineOption.indexOf('?');
    if (queryIndex > 0) {
      return engineOption.substring(0, queryIndex);
    }
    return engineOption;
  };

  const getInputName = () => {
    if (isDefaultEngine) {
      return engineOption.includes('baidu') ? 'wd' : 'q';
    }
    // 自定义引擎：找到参数值为 test/tset 的参数名
    // 匹配 ?name=test 或 &name=test 或 ?name=tset 等
    const match = engineOption.match(/[?&]([a-zA-Z0-9_-]+)=(tset|test)/i);
    return match ? match[1] : 'q';
  };

  return (
    <SearchForm action={getFormAction()} centered={centered} visible={visible}>
      <Icon id="jizhi-search-icon" icon="search" size={16} color={iconColor} />
      <Input
        ref={inputRef}
        className={focused || value ? 'active' : null}
        onFocus={onFocus}
        onBlur={onBlur}
        onChange={onChange}
        name={getInputName()}
        autoComplete="off"
        isDarkMode={isDarkMode}
      />
    </SearchForm>
  );
};

SearchInput.propTypes = {
  value: PropTypes.string,
  focused: PropTypes.bool,
  engineOption: PropTypes.string,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  onChange: PropTypes.func,
  isDarkMode: PropTypes.bool,
  centered: PropTypes.bool,
  visible: PropTypes.bool,
};

export default SearchInput;
