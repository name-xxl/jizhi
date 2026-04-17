import React, { Component } from 'react';
import { hot } from 'react-hot-loader';
import { ReactP5Wrapper } from 'react-p5-wrapper';
import { InlineAlert } from 'evergreen-ui';
import waves from './sketchs/waves';
import blobs from './sketchs/blobs';
import Verses from './components/Verses';
import ConfigMenu from './components/ConfigMenu';
import SearchInput from './components/SearchInput';
import ColorName from './components/ColorName';
import { saveBackground, insertFont, fetchAndSetFont, pickColor, isDarkModeEnabled } from './utils';
import Storager from './utils/storager';
import { load } from './utils/jinrishici';
import {
  HORIZONTAL,
  VERTICAL,
  WAVES,
  GOOGLE_SEARCH,
  DEFAULT_SHICI,
  DEFAULT_FONT,
  DEFAULT_HOTKEY,
} from './constants/appConstants';
import GlobalStyle from './components/GlobalStyle';

const DEFAULT_SHICI_LIST = require('./constants/shici.json');

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isPlaying: true,
      showSearchBarChecked: false,
      searchBarVisible: false,
      centerSearchBarChecked: false,
      searchHotkey: DEFAULT_HOTKEY,
      isRecordingHotkey: false,
      customEngines: [],
      isAddingEngine: false,
      colorMode: 'os',
      isDarkMode: false,
      defaultPlayChecked: true,
      colorStayChecked: false,
      verses: DEFAULT_SHICI,
      versesLayout: HORIZONTAL,
      errMessage: '',
      engineOption: GOOGLE_SEARCH,
      value: '',
      focused: false,
      fontName: DEFAULT_FONT,
      waveColor: pickColor(false),
    };
  }

  componentDidMount() {
    const hasZh = navigator.languages.includes('zh');
    document.title = hasZh ? '新标签页' : 'New Tab';

    load(
      (result) => {
        Storager.set({ verses: result.data });
      },
      (err) => {
        this.setState({ errMessage: err.errMessage });
        const localShici =
          DEFAULT_SHICI_LIST[Math.floor(Math.random() * DEFAULT_SHICI_LIST.length)];
        Storager.set({ verses: localShici });
      }
    );

    Storager.get(
      [
        'verses',
        'versesLayout',
        'selected',
        'colorStayChecked',
        'defaultPlayChecked',
        'engineOption',
        'showSearchBarChecked',
        'centerSearchBarChecked',
        'searchBarVisible',
        'searchHotkey',
        'isRecordingHotkey',
        'customEngines',
        'fontName',
        'fonts',
        'colorMode',
      ],
      (res) => {
        if (res.fonts && res.fontName === res.fonts.fontName) {
          insertFont(res.fonts.value);
        }

        this.setState({
          showSearchBarChecked: !!res.showSearchBarChecked,
          centerSearchBarChecked: !!res.centerSearchBarChecked,
          searchBarVisible: !!res.showSearchBarChecked || false,
          searchHotkey: res.searchHotkey || DEFAULT_HOTKEY,
          isRecordingHotkey: false,
          customEngines: res.customEngines || [],
          colorMode: res.colorMode,
          colorStayChecked: !!res.colorStayChecked,
          defaultPlayChecked: res.defaultPlayChecked !== false,
          isVerticalVerses: res.versesLayout === VERTICAL,
          isPlaying: res.defaultPlayChecked !== false,
          verses: res.verses || DEFAULT_SHICI,
          selected: res.selected || WAVES,
          engineOption: res.engineOption || GOOGLE_SEARCH,
          fontName: res.fontName || DEFAULT_FONT,
          isDarkMode: res.colorMode === 'os' ? isDarkModeEnabled() : res.colorMode === 'dark',
          waveColor: pickColor(!!this.state.isDarkMode),
        });
      }
    );
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.colorMode !== this.state.colorMode) {
      this.setState(() => ({
        isDarkMode:
          this.state.colorMode === 'os' ? isDarkModeEnabled() : this.state.colorMode === 'dark',
        waveColor: pickColor(this.state.isDarkMode),
      }));
    }
  }

  handlePlayPauseSelect = () => this.setState((state) => ({ isPlaying: !state.isPlaying }));

  handleShowSearchBarChange = () => {
    this.setState(
      (state) => ({
        showSearchBarChecked: !state.showSearchBarChecked,
      }),
      () => {
        Storager.set({ showSearchBarChecked: this.state.showSearchBarChecked });
      }
    );
  };

  handleCenterSearchBarChange = () => {
    this.setState(
      (state) => ({
        centerSearchBarChecked: !state.centerSearchBarChecked,
      }),
      () => {
        Storager.set({ centerSearchBarChecked: this.state.centerSearchBarChecked });
      }
    );
  };

  handleColorModeOptionChange = (colorMode) =>
    this.setState({ colorMode }, () => Storager.set({ colorMode }));

  handleVersesLayoutChange = () => {
    this.setState(
      (state) => ({
        isVerticalVerses: !state.isVerticalVerses,
      }),
      () => {
        Storager.set({
          versesLayout: this.state.isVerticalVerses ? VERTICAL : HORIZONTAL,
        });
      }
    );
  };

  handleDefaultPlayChange = () => {
    this.setState(
      (state) => ({
        defaultPlayChecked: !state.defaultPlayChecked,
      }),
      () => {
        Storager.set({ defaultPlayChecked: this.state.defaultPlayChecked });
      }
    );
  };

  handleColorStayChange = () => {
    this.setState(
      (state) => ({
        colorStayChecked: !state.colorStayChecked,
      }),
      () => {
        Storager.set({ colorStayChecked: this.state.colorStayChecked });
      }
    );
  };

  handleBgOptionChange = (selected) => {
    this.setState({ selected }, () => {
      Storager.set({ selected });
    });
  };

  handleKeyDown = (e) => {
    const { keyCode, altKey } = e;
    const { searchHotkey, isRecordingHotkey } = this.state;

    // 如果正在录制热键，保存热键并退出
    if (isRecordingHotkey) {
      e.preventDefault();
      // 只记录单个按键，忽略修饰键
      if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) {
        return;
      }
      const newHotkey = {
        key: e.key,
        keyCode,
      };
      this.setState({ searchHotkey: newHotkey, isRecordingHotkey: false }, () =>
        Storager.set({ searchHotkey: newHotkey })
      );
      return;
    }

    // space
    if (keyCode === 32) this.setState((state) => ({ isPlaying: !state.isPlaying }));
    // S + alt
    if (keyCode === 83 && altKey) saveBackground();

    // left or right arrow keys
    if (keyCode === 37 || keyCode === 39) {
      this.setState(() => ({ waveColor: pickColor(this.state.isDarkMode) }));
    }

    // Custom hotkey to toggle search bar
    if (searchHotkey && keyCode === searchHotkey.keyCode) {
      e.preventDefault();
      this.setState((state) => ({ searchBarVisible: !state.searchBarVisible }));
    }

    // Esc key to hide search bar
    if (keyCode === 27) {
      this.setState({ searchBarVisible: false });
    }
  };

  handleStartRecordHotkey = () => this.setState({ isRecordingHotkey: true });

  handleCancelRecordHotkey = () => this.setState({ isRecordingHotkey: false });

  handleSaveHotkey = (newHotkey) => {
    this.setState({ searchHotkey: newHotkey, isRecordingHotkey: false }, () =>
      Storager.set({ searchHotkey: newHotkey })
    );
  };

  handleAddCustomEngine = (engine) => {
    this.setState(
      (state) => ({
        customEngines: [...state.customEngines, engine],
        isAddingEngine: false,
      }),
      () => Storager.set({ customEngines: this.state.customEngines })
    );
  };

  handleDeleteCustomEngine = (index) => {
    this.setState(
      (state) => ({
        customEngines: state.customEngines.filter((_, i) => i !== index),
      }),
      () => Storager.set({ customEngines: this.state.customEngines })
    );
  };

  handleStartAddEngine = () => this.setState({ isAddingEngine: true });

  handleCancelAddEngine = () => this.setState({ isAddingEngine: false });

  handleFontTypeChange = (fontName) => {
    if (fontName !== DEFAULT_FONT) {
      this.setState(() => ({ isFontLoading: true }));

      Storager.get(['fonts'], (res) => {
        if (res.fonts && res.fonts.fontName === fontName) {
          insertFont(res.fonts.value);
          this.setState(() => ({ isFontLoading: false }));
        } else {
          fetchAndSetFont(fontName)
            .then(() => {
              this.setState(() => ({ isFontLoading: false }));
            })
            .catch((err) => console.log(err));
        }
      });
    }

    this.setState({ fontName }, () => Storager.set({ fontName }));
  };

  handleEngineOptionChange = (engineOption) =>
    this.setState({ engineOption }, () => Storager.set({ engineOption }));

  handleChange = ({ target: { value } }) => this.setState({ value });

  handleFocus = () => this.setState({ focused: true });

  handleBlur = () => this.setState({ focused: false });

  render() {
    const {
      verses,
      isVerticalVerses,
      isPlaying,
      showSearchBarChecked,
      centerSearchBarChecked,
      searchBarVisible,
      searchHotkey,
      isRecordingHotkey,
      customEngines,
      isAddingEngine,
      defaultPlayChecked,
      colorStayChecked,
      selected,
      errMessage,
      engineOption,
      value,
      focused,
      fontName,
      isDarkMode,
      waveColor,
      isFontLoading,
      colorMode,
    } = this.state;
    const sketches = { blobs, waves };

    return selected ? (
      <div className="App" tabIndex="-1" onKeyDown={this.handleKeyDown}>
        <GlobalStyle />
        {selected === WAVES && (
          <ColorName
            key={waveColor.name}
            fontName={fontName}
            colorName={waveColor.name}
            colorStayChecked={colorStayChecked}
            isDarkMode={isDarkMode}
          />
        )}
        <Verses
          key={isVerticalVerses}
          bgOption={selected}
          verses={verses}
          isVerticalVerses={isVerticalVerses}
          engineOption={engineOption}
          isDarkMode={isDarkMode}
          fontName={fontName}
        />
        <ReactP5Wrapper
          sketch={sketches[selected]}
          isPlaying={isPlaying}
          isDarkMode={isDarkMode}
          waveColor={waveColor.hex}
        />
        <ConfigMenu
          onPlayPauseSelect={this.handlePlayPauseSelect}
          isPlaying={isPlaying}
          verticalVersesChecked={isVerticalVerses}
          showSearchBarChecked={showSearchBarChecked}
          centerSearchBarChecked={centerSearchBarChecked}
          searchBarVisible={searchBarVisible}
          searchHotkey={searchHotkey}
          isRecordingHotkey={isRecordingHotkey}
          customEngines={customEngines}
          isAddingEngine={isAddingEngine}
          isDarkMode={isDarkMode}
          onDarkModeChange={this.handleDarkModeChange}
          onShowSearchBarChange={this.handleShowSearchBarChange}
          onCenterSearchBarChange={this.handleCenterSearchBarChange}
          onStartRecordHotkey={this.handleStartRecordHotkey}
          onCancelRecordHotkey={this.handleCancelRecordHotkey}
          onSaveHotkey={this.handleSaveHotkey}
          onAddCustomEngine={this.handleAddCustomEngine}
          onDeleteCustomEngine={this.handleDeleteCustomEngine}
          onStartAddEngine={this.handleStartAddEngine}
          onCancelAddEngine={this.handleCancelAddEngine}
          defaultPlayChecked={defaultPlayChecked}
          onDefaultPlayChange={this.handleDefaultPlayChange}
          onVerticalVersesChange={this.handleVersesLayoutChange}
          colorStayChecked={colorStayChecked}
          onColorStayChange={this.handleColorStayChange}
          selected={selected}
          onBgOptionChange={this.handleBgOptionChange}
          engineOption={engineOption}
          onEngineOptionChange={this.handleEngineOptionChange}
          onColorModeOptionChange={this.handleColorModeOptionChange}
          colorMode={colorMode}
          fontName={fontName}
          onFontTypeChange={this.handleFontTypeChange}
          isFontLoading={isFontLoading}
          waveColor={waveColor}
        >
          {errMessage && (
            <div style={{ height: 30 }}>
              <InlineAlert intent="warning" marginLeft={20} marginRight={20}>
                {errMessage}
              </InlineAlert>
            </div>
          )}
        </ConfigMenu>
        <SearchInput
          value={value}
          focused={focused}
          onFocus={this.handleFocus}
          onBlur={this.handleBlur}
          onChange={this.handleChange}
          engineOption={engineOption}
          isDarkMode={isDarkMode}
          centered={centerSearchBarChecked}
          visible={showSearchBarChecked || searchBarVisible}
        />
      </div>
    ) : null;
  }
}

export default hot(module)(App);
