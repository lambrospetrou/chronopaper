(function() {

  var containerElement = document.querySelector('#chronopaper');

  var PaperForm = React.createClass({

    getInitialState: function() {
      return {
        text: ''
      };
    },

    componentDidMount: function() {
      containerElement.querySelector('.paper-text').focus();
    },

    handleTextChange: function(e) {
      this.setState({ text: e.target.value });
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
      this.setState({text: ''});

      containerElement.querySelector('.paper-text').focus();
    },

    render: function() {
      return (
        <div className="paper-form-container">
          <form className="paper-form" onSubmit={this.handleSubmit}>
            <textarea className="paper-text" placeholder="Start typing..." 
              value={this.state.text} 
              onChange={this.handleTextChange}></textarea>
            <button type="submit">Post</button>
          </form>
        </div>
      );
    }
  });

  var Paper = React.createClass({
    rawMarkup: function() {
      var rawMarkup = marked(this.props.children.toString(), {sanitize: true});
      return { __html: rawMarkup };
    },

    render: function() {
      return (
        <div className="paper">
          <h2 className="paper-title">Untitled paper</h2>
          <div dangerouslySetInnerHTML={this.rawMarkup()} />
        </div>
      );
    }
  });

  var PaperList = React.createClass({
    render: function() {
      var paperNodes = this.props.data.map(function(paper) {
        return (
          <Paper title={paper.title} key={paper.id}>{paper.text}</Paper>
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