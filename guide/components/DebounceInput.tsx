import FormControl from "@material-ui/core/FormControl/FormControl";
import FormHelperText from "@material-ui/core/FormHelperText/FormHelperText";
import Input from "@material-ui/core/Input/Input";
import InputLabel from "@material-ui/core/InputLabel/InputLabel";
import * as React from "react";
import { Subject } from "rxjs/internal/Subject";
import { debounceTime, tap } from "rxjs/operators";

export class DebounceInput extends React.Component<any> {
  private sub$: any = new Subject();
  state = {
    value: this.props.value || "",
  };

  componentDidUpdate(prevProps: any) {
    if (prevProps.value !== this.props.value && this.props.value !== this.state.value) {
      this.setState({
        value: this.props.value,
      });
    }
  }

  componentDidMount() {
    this.sub$
      .pipe(
        tap((value) => {
          this.setState({
            value,
          });
        }),
        debounceTime(500),
        tap((value: string) => {
          this.props.onChange(value);
        }),
      )
      .subscribe();
  }

  render() {
    const { name, label, error, placeholder, type } = this.props;
    return (
      <FormControl error={!!error}>
        {label && <InputLabel>{label}</InputLabel>}
        <Input
          name={name}
          value={this.state.value}
          onChange={(evt) => {
            this.sub$.next(evt.target.value);
          }}
          placeholder={placeholder}
          type={type}
        />
        {error && <FormHelperText>{error}</FormHelperText>}
      </FormControl>
    );
  }
}
