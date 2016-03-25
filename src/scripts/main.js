(function() {

  var containerElement = document.querySelector('#chronopaper');

  function setState(_this, params) {
    _this.setState(Object.assign({}, _this.state, params));
    return _this;
  }

  var PaperForm = React.createClass({

    getInitialState: function() {
      return {
        view: 'editor',
        text: '',
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

    handleTextChange: function(e) {
      setState(this, {
        text: e.target.value
      });
    },

    handleSubmit: function(e) {
      e.preventDefault();
      var text = this.state.text.trim();
      if (!text) {
        return;
      }

      // Notify for paper submit
      if (this.props.onPaperSubmit) {
        // TODO create a hash ID for the paper
        this.props.onPaperSubmit({text: text, id: text});
      }
      // Reset the paper form.
      setState(this, {
        text: ''
      });

      containerElement.querySelector('.paper-text').focus();
    },

    rawMarkup: function() {
      var rawMarkup = marked(this.state.text, {sanitize: true});
      return { __html: rawMarkup };
    },

    render: function() {
      var editorView = null;
      if (this.state.view === 'editor') {
        editorView = (
          <div>
            <textarea className="paper-text" placeholder="Start typing..." 
              value={this.state.text} 
              onChange={this.handleTextChange}></textarea>
            <button type="submit">Post</button>
          </div>
        );
      } else if (this.state.view === 'markdown') {
        editorView = <div dangerouslySetInnerHTML={this.rawMarkup()} />;
      }
      return (
        <div className="paper-form-container">
          <form className="paper-form" onSubmit={this.handleSubmit}>
            <label>View Markdown<input id="chk-markdown" type="checkbox" value="markdown" onChange={this.handleViewChange} /></label>
            { editorView }
          </form>
        </div>
      );
    }
  });

  var Paper = React.createClass({
    render: function() {
      return (
        <div className="paper">
          <h2 className="paper-title">Untitled paper - {this.props.paper.id}</h2>
        </div>
      );
    }
  });

  var PaperList = React.createClass({
    render: function() {
      var paperNodes = this.props.data.map(function(paper) {
        return (
          <Paper paper={paper} key={paper.id} />
        );
      });
      return (
        <div className="paperList">{paperNodes}</div>
      );
    }
  });

  var PaperBox = React.createClass({
    loadPapersFromAPI: function() {
      return [];
    },

    getInitialState: function() {
      return { 
        data: [] 
      };
    },

    componentDidMount: function() {
      this.loadPapersFromAPI();
    },

    handleOnPaperSubmit: function(paper) {
      this.setState({data: this.state.data.concat([paper])});
        // TODO send to the server and update the data[]
      console.log(paper);
    },

    render: function() {
      return (
        <div className="paper-box">
          <h1>Papers</h1>
          <PaperList data={this.state.data} />
          <PaperForm onPaperSubmit={this.handleOnPaperSubmit} />
        </div>
      );
    }
  });

  ReactDOM.render(
    <PaperBox />,
    containerElement
  );
}).call(this);