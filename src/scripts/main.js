(function() {

  // https://john-dugan.com/javascript-debounce/
  function debounce(func, wait, immediate) {
    var timeout;
    if (immediate === true) {
      return function() {
        func.apply(this, arguments);
      };
    }
    return function() {
      console.log('i');
      var context = this,
          args = arguments;

      var later = function() {
        timeout = null;
        func.apply(context, args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait || 200);
    };
  }

  function buildPaperModel() {
    var now = moment();
    return {
      text: '',
      id: now.toISOString(),
      dateUpdated: now,
      dateCreated: now
    };
  } 

  var containerElement = document.querySelector('#chronopaper');

  function setState(_this, params) {
    _this.setState(Object.assign({}, _this.state, params));
    return _this;
  }

  // This component uses its own state to keep the view updated and the props
  // are only used for the initial load.
  // Props: value[String], onChange[function(String)], debounceEnabled[Boolean]
  var ExpandableTextarea = React.createClass({
    getInitialState: function() {
      return {
        value: this.props.value
      };
    },
    componentWillReceiveProps: function(nextProps) {
      setState(this, {
        value: nextProps.value
      });
    },

    componentDidMount: function() {
      // create the debounced onChange method if required
      if (this.props.debounceEnabled === 'true') {
        this.onChangeWrapper = debounce(function(value) {
          console.log('actual onChange');
          if (this.props.onChange) {
            this.props.onChange(value);
          }
        }.bind(this));
      } else {
        this.onChangeWrapper = function(value) {
          if (this.props.onChange) {
            this.props.onChange(value);
          }
        };
      }
      
    },

    handleTextChange: function(e) {
      var text = e.target.value;
      this.setState({ value: text });
      this.onChangeWrapper(text);
    },

    render: function() {
      return (
        <div className="expanding-area">
          <pre><span>{this.state.value}</span><br/></pre>
          <textarea
            value={this.state.value}
            onChange={this.handleTextChange}></textarea>
        </div>
      );
    }
  });
/*
  // This component uses its own state to keep the view updated and the props
  // are only used for the initial load.
  var ContentEditable = React.createClass({
    getInitialState: function() {
      return {
        value: this.props.value
      };
    },
    componentWillReceiveProps: function(nextProps) {
      //console.log('componentWillReceiveProps', Object.assign({}, nextProps));
      setState(this, {
        value: nextProps.value
      });
    },

     componentDidMount: function() {
      // create the debounced onChange method
      this.onChangeDebounced = debounce(function() {
        console.log('actual onChange');
        // Notify for paper submit
        if (this.props.onChange) {
          this.props.onChange(this.state.value);
        }
      }.bind(this));
      this.findDOMNode
    },

    handleTextChange: function(e) {
      //console.log(Object.assign({}, e));
      //var text = e.target.value;
      var text = e.target.textContent;

      this.setState({ value: text });
      this.onChangeDebounced();
    },

    render: function() {
      //console.log('render');
      var editorContent = (
        <div contentEditable="true" spellCheck="true" className="editor-content" 
              onInput={this.handleTextChange}
              dangerouslySetInnerHTML={{__html: this.state.value}}
              ref={function(input) {
                    if (input != null) {
                      input.focus();
                    }
                  }}></div>
      );
      return (
        <div className="expanding-area">{editorContent}</div>
      );
    }
  });
*/
  var PaperForm = React.createClass({

    getInitialState: function() {
      return {
        view: 'editor'
      };
    },

    componentDidMount: function() {
    },

    handleViewChange: function(e) {
      setState(this, {
        view: e.target.checked === true ? 'markdown' : 'editor'
      });
    },

    handlePaperTextChange: function(text) {
      //console.log(Object.assign({}, text));
      // update the paper
      var paper = Object.assign({}, this.props.paper, {
        text: text,
        dateUpdated: moment()
      });

      // Notify for paper submit
      if (this.props.onPaperSubmit) {
        // TODO create a hash ID for the paper
        this.props.onPaperSubmit(paper);
      }
    },

    handleNewPaper: function(e) {
      e.preventDefault();
      if (typeof this.props.onCreateNewPaper === 'function') {
        this.props.onCreateNewPaper();
      }
    },

    rawMarkup: function() {
      var rawMarkup = marked(this.props.paper.text, {sanitize: true});
      return { __html: rawMarkup };
    },

    render: function() {
      var editorView = null;
      if (this.state.view === 'editor') {
        editorView = (
          <div>
            <div className="paper-text">
              <ExpandableTextarea value={this.props.paper.text}
                onChange={this.handlePaperTextChange}
                debounceEnabled="true"/>
            </div>
            <button type="submit">Create New</button>
          </div>
        );
      } else if (this.state.view === 'markdown') {
        editorView = <div className="paper-text" dangerouslySetInnerHTML={this.rawMarkup()} />;
      }
      return (
        <div className="paper-form-container">
          <form className="paper-form" onSubmit={this.handleNewPaper}>
            <label>View Markdown<input id="chk-markdown" type="checkbox" value="markdown" onChange={this.handleViewChange} /></label>
            { editorView }
          </form>
        </div>
      );
    }
  });

  var Paper = React.createClass({
    onClick: function(e) {
      if (this.props.onClick) {
        this.props.onClick(e);
      }
    },

    shouldComponentUpdate: function(nextProps, nextState) {
      return this.props.paper.dateUpdated.toISOString() !== nextProps.paper.dateUpdated.toISOString();
    },

    render: function() {
      return (
        <div className="paper" onClick={this.onClick}>
          <h2 className="paper-title">Untitled paper - {this.props.paper.id}</h2>
          <sub>{this.props.paper.dateUpdated.toISOString()}</sub>
        </div>
      );
    }
  });

  var PaperList = React.createClass({
    handlePaperOnClick: function(props, paper, idx) {
      if (typeof props.onSelectedPaper === 'function') {
        props.onSelectedPaper(paper, idx);
      }
    },

    render: function() {
      var _this = this;
      var paperNodes = this.props.papers.map(function(paper, idx) {
        return (
          <li key={idx}><Paper paper={paper} onClick={_this.handlePaperOnClick.bind(_this, _this.props, paper, idx)} /></li>
        );
      }).reverse();
      return (
        <div className="paper-list-container">
          <ul className="paper-list">{paperNodes}</ul>
        </div>
      );
    }
  });

  var PaperBox = React.createClass({
    getInitialState: function() {
      // TODO make the asynchronous code to fetch papers from the API
      return { 
        papers: [buildPaperModel()],
        selectedPaperIdx: 0
      };
    },

    componentDidMount: function() {},

    handleOnSelectedPaper: function(paper, idx, previousPaper) {
      console.log('onSelectedPaper', paper, idx, previousPaper);
      setState(this, {
        selectedPaperIdx: idx
      });
    },

    handleOnPaperSubmit: function(paper) {
      // Make sure to edit the proper paper
      // For now we do not reorder the papers in any way
      var papers = this.state.papers;
      papers[this.state.selectedPaperIdx] = Object.assign({}, paper);
      setState(this, {papers: papers});
        // TODO send to the server and update the data[]
    },

    handleOnCreateNewPaper: function() {
      setState(this, {
        papers: this.state.papers.concat([buildPaperModel()]),
        selectedPaperIdx: this.state.papers.length
      });
    },

    render: function() {
      //console.log(Object.assign({}, this.state));
      return (
        <div className="paper-box">
          <PaperList 
            papers={this.state.papers} 
            onSelectedPaper={this.handleOnSelectedPaper}/>
          <PaperForm
            paper={this.state.papers[this.state.selectedPaperIdx]} 
            onPaperSubmit={this.handleOnPaperSubmit}
            onCreateNewPaper={this.handleOnCreateNewPaper} />
        </div>
      );
    }
  });

  ReactDOM.render(
    <PaperBox />,
    containerElement
  );
}).call(this);