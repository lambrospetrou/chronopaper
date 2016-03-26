(function() {

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

  var ContentEditable = React.createClass({
    getInitialState: function() {
      return {
        value: this.props.value
      };
    },

    handleTextChange: function(e) {
      console.log(Object.assign({}, e));
      var text = '';
      if (e.type === 'change') {
        text = e.target.value;
      } else if (e.type === 'keyup' || e.type === 'blur') {
        // TODO need this???
        text = e.target.innerText;
      } else if (!!e.target) {
        text = e.target.innerText;
      }

      // Notify for paper submit
      if (this.props.onChange && text !== this.state.value) {
        // TODO create a hash ID for the paper
        this.props.onChange(text);
      }
      setState(this, { value: text });
    },

    rawMarkup: function() {
      var value = '';
      if (!!this.props.value) {
        value = this.props.value;
      }
      console.log({ value: value });
      return { __html: value };
    },

    render: function() {
      return (
        <pre contentEditable="true" className="content-editable-text" 
          onInput={this.handleTextChange}
          dangerouslySetInnerHTML={this.rawMarkup()}></pre>
      );
      /*
      return (
        <textarea className="content-editable-text" placeholder="Start typing..." 
          value={this.props.value} 
          onChange={this.handleTextChange}></textarea>
      );
      */
    }
  });

  var PaperForm = React.createClass({

    getInitialState: function() {
      return {
        view: 'editor'
      };
    },

    componentDidMount: function() {
      containerElement.querySelector('.paper-text').focus();
    },

    handleViewChange: function(e) {
      var html = '';
      if (e.target.checked === true) {
        html = containerElement.querySelector('.paper-text').innerHTML;
      }
      setState(this, {
        view: e.target.checked === true ? 'markdown' : 'editor',
        innerHTML: html
      });
    },

    handlePaperTextChange: function(text) {
      console.log(Object.assign({}, text));
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
              <ContentEditable onChange={this.handlePaperTextChange} value={this.props.paper.text}/>
            </div>
            <button type="submit">Create New</button>
          </div>
        );
      } else if (this.state.view === 'markdown') {
        editorView = <div dangerouslySetInnerHTML={this.rawMarkup()} />;
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
      console.log(paper);
    },

    handleOnCreateNewPaper: function() {
      setState(this, {
        papers: this.state.papers.concat([buildPaperModel()]),
        selectedPaperIdx: this.state.papers.length
      });
    },

    render: function() {
      console.log(Object.assign({}, this.state));
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