(function() {

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
          <div className="papersBox">
            <h1>Papers</h1>
            <PaperList data={this.state.data} />
            <PaperForm onPaperSubmit={this.handleOnPaperSubmit} />
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
          <div className="paperList">
            {paperNodes}
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
            <h2 className="paperTitle">
              {this.props.title}
            </h2>
            <div dangerouslySetInnerHTML={this.rawMarkup()} />
          </div>
        );
      }
    });

    var PaperForm = React.createClass({

      getInitialState: function() {
        return {
          title: '', text: ''
        };
      },

      handleTitleChange: function(e) {
        this.setState({ title: e.target.value });
      },
      handleTextChange: function(e) {
        this.setState({ text: e.target.value });
      },
      handleSubmit: function(e) {
        e.preventDefault();
        var title = this.state.title.trim();
        var text = this.state.text.trim();
        if (!text || !title) {
          return;
        }

        // Notify for paper submit
        if (this.props.onPaperSubmit) {
          this.props.onPaperSubmit({title: title, text: text});
        }
        // Reset the paper form.
        this.setState({title: '', text: ''});
      },

      render: function() {
        return (
          <div className="paperForm">
            <form className="paperForm-form" onSubmit={this.handleSubmit}>
              <input type="text" placeholder="Paper Title" value={this.state.title} onChange={this.handleTitleChange} />
              <textarea placeholder="Start typing..." value={this.state.text} onChange={this.handleTextChange}></textarea>
              <button type="submit">Post</button>
            </form>
          </div>
        );
      }
    });

    ReactDOM.render(
      <PaperBox url='/api/comments' />,
      document.getElementById('chronopaper')
    );	
}).call(this);