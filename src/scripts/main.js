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
      setState(this, {
        view: e.target.checked === true ? 'markdown' : 'editor'
      });
    },

    handlePaperTextChange: function(e) {
      var text = e.target.value;

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
            <textarea className="paper-text" placeholder="Start typing..." 
              value={this.props.paper.text} 
              onChange={this.handlePaperTextChange}></textarea>
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
          <Paper paper={paper} key={idx} onClick={_this.handlePaperOnClick.bind(_this, _this.props, paper, idx)} />
        );
      });
      return (
        <div className="paper-list">{paperNodes}</div>
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
          <h1>Papers</h1>
          <PaperList papers={this.state.papers} onSelectedPaper={this.handleOnSelectedPaper}/>
          <PaperForm paper={this.state.papers[this.state.selectedPaperIdx]} 
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