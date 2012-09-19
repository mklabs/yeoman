# Credits to npm's. Awesome completion utility.
#
# Yeoman command completion script, based on npm completion script.

###-begin-yeoman-completion-###
#
# Installation: yeoman-completion >> ~/.bashrc  (or ~/.zshrc)
# Or, maybe: yeoman-completion > /usr/local/etc/bash_completion.d/npm
#

COMP_WORDBREAKS=${COMP_WORDBREAKS/=/}
COMP_WORDBREAKS=${COMP_WORDBREAKS/@/}
export COMP_WORDBREAKS

if type complete &>/dev/null; then
  _yeoman_completion () {
    local si="$IFS"
    IFS=$'\n' COMPREPLY=($(COMP_CWORD="$COMP_CWORD" \
                           COMP_LINE="$COMP_LINE" \
                           COMP_POINT="$COMP_POINT" \
                           yeoman-completion -- "${COMP_WORDS[@]}" \
                           2>/dev/null)) || return $?
    IFS="$si"
  }
  complete -F _yeoman_completion yeoman
elif type compdef &>/dev/null; then
  _yeoman_completion() {
    si=$IFS
    compadd -- $(COMP_CWORD=$((CURRENT-1)) \
                 COMP_LINE=$BUFFER \
                 COMP_POINT=0 \
                 yeoman-completion -- "${words[@]}" \
                 2>/dev/null)
    IFS=$si
  }
  compdef _yeoman_completion yeoman
elif type compctl &>/dev/null; then
  _yeoman_completion () {
    local cword line point words si
    read -Ac words
    read -cn cword
    let cword-=1
    read -l line
    read -ln point
    si="$IFS"
    IFS=$'\n' reply=($(COMP_CWORD="$cword" \
                       COMP_LINE="$line" \
                       COMP_POINT="$point" \
                       yeoman-completion -- "${words[@]}" \
                       2>/dev/null)) || return $?
    IFS="$si"
  }
  compctl -K _yeoman_completion yeoman
fi
###-end-yeoman-completion-###
